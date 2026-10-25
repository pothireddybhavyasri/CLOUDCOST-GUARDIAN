import { describe, it, expect } from 'vitest'
import {
  calculateSavings,
  isResourceIdle,
  evaluateRightsizing,
  evaluateIdleCleanup,
  evaluateStorageTiering,
  evaluateAlerts,
  generateSyntheticInventory,
  generateRecommendations,
  generate30DayHistoricalCosts,
  generateUtilizationHistory,
  generateDataQualityReport,
  exportResourcesToCSV,
  exportRecommendationsToCSV,
  CloudResource,
  HOURS_PER_MONTH
} from '../lib/guardian-engine'

describe('CloudCost Guardian — Savings Calculations', () => {
  it('correctly calculates monthly savings for EC2 downsize', () => {
    // Current $0.096/hr, suggested $0.021/hr
    // (0.096 - 0.021) * 720 = 0.075 * 720 = 54.00
    const savings = calculateSavings(0.096, 0.021)
    expect(savings).toBe(54.00)
  })

  it('correctly calculates monthly savings for RDS downsize', () => {
    // Current $0.384/hr, suggested $0.192/hr
    // (0.384 - 0.192) * 720 = 0.192 * 720 = 138.24
    const savings = calculateSavings(0.384, 0.192)
    expect(savings).toBe(138.24)
  })

  it('returns 0 when suggested cost is greater than or equal to current cost', () => {
    expect(calculateSavings(0.05, 0.10)).toBe(0)
    expect(calculateSavings(0.05, 0.05)).toBe(0)
  })

  it('handles negative inputs safely by returning 0', () => {
    expect(calculateSavings(-0.10, 0.05)).toBe(0)
    expect(calculateSavings(0.10, -0.05)).toBe(0)
  })
})

describe('CloudCost Guardian — Idle Resource Detection', () => {
  it('identifies unattached storage volumes as idle regardless of days', () => {
    const isIdle = isResourceIdle({
      type: 'STORAGE',
      cpuUtilization: 0,
      memoryUtilization: 0,
      idleDays: 1,
      status: 'IDLE',
      unattachedStorage: true
    })
    expect(isIdle).toBe(true)
  })

  it('identifies stopped compute instances as idle', () => {
    const isIdle = isResourceIdle({
      type: 'COMPUTE',
      cpuUtilization: 0,
      memoryUtilization: 0,
      idleDays: 5,
      status: 'STOPPED'
    })
    expect(isIdle).toBe(true)
  })

  it('identifies compute instance with <5% CPU and <15% RAM for >=7 days as idle', () => {
    const isIdle = isResourceIdle({
      type: 'COMPUTE',
      cpuUtilization: 2.5,
      memoryUtilization: 8.0,
      idleDays: 10,
      status: 'ACTIVE'
    })
    expect(isIdle).toBe(true)
  })

  it('does NOT mark instance as idle if idle days is less than 7', () => {
    const isIdle = isResourceIdle({
      type: 'COMPUTE',
      cpuUtilization: 2.5,
      memoryUtilization: 8.0,
      idleDays: 4,
      status: 'ACTIVE'
    })
    expect(isIdle).toBe(false)
  })

  it('does NOT mark active heavily loaded instance as idle', () => {
    const isIdle = isResourceIdle({
      type: 'COMPUTE',
      cpuUtilization: 65.0,
      memoryUtilization: 72.0,
      idleDays: 0,
      status: 'ACTIVE'
    })
    expect(isIdle).toBe(false)
  })
})

describe('CloudCost Guardian — Rightsizing & Recommendation Engine', () => {
  const sampleOverprovisionedEC2: CloudResource = {
    id: 'res-test-ec2',
    name: 'test-api-instance',
    provider: 'AWS',
    service: 'EC2',
    region: 'us-east-1',
    type: 'COMPUTE',
    instanceType: 'c5.2xlarge',
    status: 'OVER_PROVISIONED',
    monthlyCost: 244.80,
    hourlyCost: 0.34,
    cpuUtilization: 14.0,
    memoryUtilization: 22.0,
    storageUtilization: 40.0,
    networkIOGB: 500,
    isIdle: false,
    idleDays: 0,
    unattachedStorage: false,
    tags: { Env: 'prod' },
    createdAt: '2026-01-01T00:00:00Z',
    lastActiveAt: '2026-10-25T00:00:00Z'
  }

  it('generates a rightsizing recommendation for low CPU compute', () => {
    const rec = evaluateRightsizing(sampleOverprovisionedEC2)
    expect(rec).not.toBeNull()
    expect(rec?.type).toBe('RIGHTSIZING')
    expect(rec?.potentialMonthlySavings).toBeGreaterThan(0)
    expect(rec?.annualSavings).toBe(Number((rec!.potentialMonthlySavings * 12).toFixed(2)))
    expect(rec?.recommendedConfiguration).toBe('c5.xlarge')
  })

  it('generates unattached volume cleanup recommendation', () => {
    const unattachedDisk: CloudResource = {
      ...sampleOverprovisionedEC2,
      id: 'vol-test-orphan',
      name: 'orphan-vol',
      type: 'STORAGE',
      service: 'EBS',
      instanceType: 'gp3 (500 GB)',
      monthlyCost: 40.00,
      isIdle: true,
      idleDays: 20,
      unattachedStorage: true
    }

    const rec = evaluateIdleCleanup(unattachedDisk)
    expect(rec).not.toBeNull()
    expect(rec?.type).toBe('UNATTACHED_VOLUME')
    expect(rec?.potentialMonthlySavings).toBe(40.00)
    expect(rec?.projectedMonthlyCost).toBe(0)
  })

  it('evaluates storage lifecycle transition for high-cost S3 buckets', () => {
    const bucket: CloudResource = {
      ...sampleOverprovisionedEC2,
      id: 'bucket-assets',
      name: 'prod-large-media',
      type: 'STORAGE',
      service: 'S3',
      instanceType: 'Standard (10 TB)',
      monthlyCost: 230.00,
      isIdle: false
    }

    const rec = evaluateStorageTiering(bucket)
    expect(rec).not.toBeNull()
    expect(rec?.type).toBe('STORAGE_TIERING')
    expect(rec?.potentialMonthlySavings).toBe(Number((230.00 * 0.65).toFixed(2)))
  })
})

describe('CloudCost Guardian — Threshold Alert Engine', () => {
  it('triggers a CRITICAL budget alert when spend exceeds threshold', () => {
    const inventory = generateSyntheticInventory()
    const totalCost = inventory.reduce((sum, r) => sum + r.monthlyCost, 0)
    // Pass budget lower than total cost
    const alerts = evaluateAlerts(inventory, totalCost - 100)

    const budgetAlert = alerts.find(a => a.category === 'BUDGET_OVERRUN')
    expect(budgetAlert).toBeDefined()
    expect(budgetAlert?.severity).toBe('CRITICAL')
  })

  it('triggers alerts for unattached orphan volumes', () => {
    const inventory = generateSyntheticInventory()
    const alerts = evaluateAlerts(inventory, 10000)

    const unattachedAlert = alerts.find(a => a.id === 'alert-unattached-volumes')
    expect(unattachedAlert).toBeDefined()
    expect(unattachedAlert?.category).toBe('IDLE_RESOURCE')
  })
})

describe('CloudCost Guardian — Synthetic Ingestion & Telemetry Generator', () => {
  it('generates multi-cloud resources covering AWS, Azure, and GCP', () => {
    const inventory = generateSyntheticInventory()
    expect(inventory.length).toBeGreaterThanOrEqual(10)

    const providers = new Set(inventory.map(r => r.provider))
    expect(providers.has('AWS')).toBe(true)
    expect(providers.has('AZURE')).toBe(true)
    expect(providers.has('GCP')).toBe(true)
  })

  it('generates consistent 30-day historical time-series data', () => {
    const history = generate30DayHistoricalCosts()
    expect(history.length).toBe(30)
    for (const day of history) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(day.cost).toBeGreaterThan(0)
      expect(day.aws).toBeGreaterThan(0)
      expect(day.azure).toBeGreaterThan(0)
      expect(day.gcp).toBeGreaterThan(0)
    }
  })

  it('generates 24-hour utilization metrics with CPU, memory, storage, and network', () => {
    const points = generateUtilizationHistory()
    expect(points.length).toBe(24)
    for (const p of points) {
      expect(p.avgCpu).toBeGreaterThanOrEqual(0)
      expect(p.avgCpu).toBeLessThanOrEqual(100)
      expect(p.avgMemory).toBeGreaterThanOrEqual(0)
      expect(p.networkThroughputMbps).toBeGreaterThan(0)
    }
  })

  it('produces valid data quality report with synthetic attribution watermark', () => {
    const inventory = generateSyntheticInventory()
    const report = generateDataQualityReport(inventory)

    expect(report.score).toBeGreaterThan(80)
    expect(report.syntheticDataMode).toBe(true)
    expect(report.attributionWatermark).toContain('SYNTHETIC-TELEMETRY')
    expect(report.dataChecks.length).toBeGreaterThanOrEqual(4)
  })
})

describe('CloudCost Guardian — CSV Exporters', () => {
  it('exports RFC-4180 compliant CSV string for resources', () => {
    const inventory = generateSyntheticInventory()
    const csv = exportResourcesToCSV(inventory)

    const lines = csv.split('\r\n')
    expect(lines.length).toBe(inventory.length + 1) // header + rows
    expect(lines[0]).toContain('"Resource ID"')
    expect(lines[0]).toContain('"Monthly Cost ($)"')
    expect(lines[1]).toContain('"res-')
  })

  it('exports RFC-4180 compliant CSV string for recommendations', () => {
    const inventory = generateSyntheticInventory()
    const recs = generateRecommendations(inventory)
    const csv = exportRecommendationsToCSV(recs)

    const lines = csv.split('\r\n')
    expect(lines.length).toBe(recs.length + 1)
    expect(lines[0]).toContain('"Recommendation ID"')
    expect(lines[0]).toContain('"Potential Monthly Savings ($)"')
  })
})
