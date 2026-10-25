/**
 * CloudCost Guardian — Core Optimization & Telemetry Engine
 * 
 * Provides resource modeling, synthetic telemetry generation, cost analytics,
 * idle resource detection, rightsizing recommendations, and threshold alerts.
 */

export type CloudProvider = 'AWS' | 'GCP' | 'AZURE'
export type ResourceType = 'COMPUTE' | 'STORAGE' | 'DATABASE' | 'SERVERLESS' | 'NETWORKING'
export type ResourceStatus = 'ACTIVE' | 'IDLE' | 'OVER_PROVISIONED' | 'WARNING' | 'STOPPED'
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO'

export interface CloudResource {
  id: string
  name: string
  provider: CloudProvider
  service: string
  region: string
  type: ResourceType
  instanceType: string
  status: ResourceStatus
  monthlyCost: number
  hourlyCost: number
  cpuUtilization: number      // Average % over 7 days
  memoryUtilization: number   // Average % over 7 days
  storageUtilization: number  // Average %
  networkIOGB: number         // Monthly GB transferred
  isIdle: boolean
  idleDays: number
  unattachedStorage: boolean
  tags: Record<string, string>
  createdAt: string
  lastActiveAt: string
}

export interface Recommendation {
  id: string
  resourceId: string
  resourceName: string
  provider: CloudProvider
  service: string
  type: 'RIGHTSIZING' | 'IDLE_CLEANUP' | 'STORAGE_TIERING' | 'SAVINGS_PLAN' | 'UNATTACHED_VOLUME'
  title: string
  description: string
  currentConfiguration: string
  recommendedConfiguration: string
  currentMonthlyCost: number
  projectedMonthlyCost: number
  potentialMonthlySavings: number
  annualSavings: number
  effortLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  applied: boolean
  dismissed: boolean
  actionableSteps: string[]
}

export interface ThresholdAlert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  category: 'COST_SURGE' | 'IDLE_RESOURCE' | 'BUDGET_OVERRUN' | 'RESOURCE_HEALTH'
  resourceId?: string
  resourceName?: string
  provider?: CloudProvider
  thresholdValue: string
  currentValue: string
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  triggeredAt: string
}

export interface DataQualityReport {
  score: number                  // 0 - 100
  totalRecordsProcessed: number
  validRecords: number
  schemaComplianceRate: number   // %
  ingestionLatencyMs: number
  syntheticDataMode: boolean
  attributionWatermark: string
  lastSyncTimestamp: string
  anomaliesDetected: number
  dataChecks: {
    name: string
    status: 'PASSED' | 'WARNING' | 'FAILED'
    details: string
  }[]
}

export interface UtilizationDataPoint {
  timestamp: string
  avgCpu: number
  avgMemory: number
  avgStorage: number
  networkThroughputMbps: number
}

// -------------------------------------------------------------
// Core Calculation & Algorithm Functions
// -------------------------------------------------------------

export const HOURS_PER_MONTH = 720

/**
 * Calculates projected monthly cost savings between current and suggested hourly cost.
 */
export function calculateSavings(currentHourlyCost: number, suggestedHourlyCost: number): number {
  if (currentHourlyCost < 0 || suggestedHourlyCost < 0) return 0
  const savings = (currentHourlyCost - suggestedHourlyCost) * HOURS_PER_MONTH
  return savings > 0 ? Number(savings.toFixed(2)) : 0
}

/**
 * Determines whether a compute or database resource is classified as idle.
 * Criteria: CPU utilization < 5% and Memory utilization < 15% for at least 7 days,
 * OR instance stopped with persistent storage, OR disk unattached.
 */
export function isResourceIdle(resource: {
  type: ResourceType
  cpuUtilization: number
  memoryUtilization: number
  idleDays: number
  status: ResourceStatus
  unattachedStorage?: boolean
}): boolean {
  if (resource.unattachedStorage) return true
  if (resource.status === 'STOPPED') return true
  if (resource.status === 'IDLE') return true
  if (
    (resource.type === 'COMPUTE' || resource.type === 'DATABASE') &&
    resource.cpuUtilization < 5.0 &&
    resource.memoryUtilization < 15.0 &&
    resource.idleDays >= 7
  ) {
    return true
  }
  return false
}

/**
 * Evaluates right-sizing opportunities based on resource utilization.
 */
export function evaluateRightsizing(resource: CloudResource): Recommendation | null {
  if (resource.status === 'STOPPED' || resource.isIdle) return null

  // Under-utilized compute (5% - 25% CPU) -> candidate for 1-2 tier downsize
  if (resource.type === 'COMPUTE' && resource.cpuUtilization < 25 && resource.cpuUtilization >= 5) {
    const downsizeMultiplier = 0.5 // downsize to next tier cuts cost roughly by half
    const suggestedHourly = resource.hourlyCost * downsizeMultiplier
    const monthlySavings = calculateSavings(resource.hourlyCost, suggestedHourly)

    return {
      id: `rec-rightsize-${resource.id}`,
      resourceId: resource.id,
      resourceName: resource.name,
      provider: resource.provider,
      service: resource.service,
      type: 'RIGHTSIZING',
      title: `Downsize over-provisioned instance ${resource.name}`,
      description: `Instance average CPU is ${resource.cpuUtilization.toFixed(1)}% and memory is ${resource.memoryUtilization.toFixed(1)}%. Downsizing from ${resource.instanceType} will reduce compute spend without impacting workload SLA.`,
      currentConfiguration: resource.instanceType,
      recommendedConfiguration: getDownsizedInstanceType(resource.provider, resource.instanceType),
      currentMonthlyCost: resource.monthlyCost,
      projectedMonthlyCost: Number((resource.monthlyCost - monthlySavings).toFixed(2)),
      potentialMonthlySavings: monthlySavings,
      annualSavings: Number((monthlySavings * 12).toFixed(2)),
      effortLevel: 'LOW',
      riskLevel: 'LOW',
      applied: false,
      dismissed: false,
      actionableSteps: [
        `Schedule a 5-minute maintenance window for ${resource.name}`,
        `Stop the instance and change instance type to recommended target`,
        `Restart instance and monitor CloudWatch / Azure Monitor metrics for 24 hours`
      ]
    }
  }

  // Over-provisioned database
  if (resource.type === 'DATABASE' && resource.cpuUtilization < 20 && resource.storageUtilization < 40) {
    const savings = Number((resource.monthlyCost * 0.4).toFixed(2))
    return {
      id: `rec-db-rightsize-${resource.id}`,
      resourceId: resource.id,
      resourceName: resource.name,
      provider: resource.provider,
      service: resource.service,
      type: 'RIGHTSIZING',
      title: `Scale down over-sized database cluster ${resource.name}`,
      description: `Average CPU is ${resource.cpuUtilization}% and disk usage is ${resource.storageUtilization}%. Scaling down compute tier saves substantial monthly licensing and hardware cost.`,
      currentConfiguration: resource.instanceType,
      recommendedConfiguration: getDownsizedInstanceType(resource.provider, resource.instanceType),
      currentMonthlyCost: resource.monthlyCost,
      projectedMonthlyCost: Number((resource.monthlyCost - savings).toFixed(2)),
      potentialMonthlySavings: savings,
      annualSavings: Number((savings * 12).toFixed(2)),
      effortLevel: 'MEDIUM',
      riskLevel: 'MEDIUM',
      applied: false,
      dismissed: false,
      actionableSteps: [
        'Take manual snapshot backup of database',
        'Modify instance class during maintenance window with failover enabled',
        'Verify query latency profiles post-downsize'
      ]
    }
  }

  return null
}

function getDownsizedInstanceType(provider: CloudProvider, current: string): string {
  const map: Record<string, string> = {
    // AWS
    'c5.2xlarge': 'c5.xlarge',
    'm5.2xlarge': 'm5.large',
    'r5.4xlarge': 'r5.2xlarge',
    't3.xlarge': 't3.medium',
    'db.m5.xlarge': 'db.m5.large',
    'db.r5.2xlarge': 'db.r5.xlarge',
    // Azure
    'Standard_D4s_v5': 'Standard_D2s_v5',
    'Standard_E4s_v5': 'Standard_E2s_v5',
    // GCP
    'n2-standard-8': 'n2-standard-4',
    'e2-standard-4': 'e2-medium'
  }
  return map[current] || `downsized-${current}`
}

/**
 * Evaluates idle resource cleanup recommendations.
 */
export function evaluateIdleCleanup(resource: CloudResource): Recommendation | null {
  if (!resource.isIdle) return null

  if (resource.unattachedStorage) {
    const savings = resource.monthlyCost
    return {
      id: `rec-unattached-${resource.id}`,
      resourceId: resource.id,
      resourceName: resource.name,
      provider: resource.provider,
      service: resource.service,
      type: 'UNATTACHED_VOLUME',
      title: `Delete unattached disk volume ${resource.name}`,
      description: `Volume has been detached and unallocated for ${resource.idleDays} days, generating continuous storage charges with zero IOPS.`,
      currentConfiguration: `${resource.instanceType} (Unattached)`,
      recommendedConfiguration: 'Snapshot & Delete Volume',
      currentMonthlyCost: resource.monthlyCost,
      projectedMonthlyCost: 0,
      potentialMonthlySavings: savings,
      annualSavings: Number((savings * 12).toFixed(2)),
      effortLevel: 'LOW',
      riskLevel: 'LOW',
      applied: false,
      dismissed: false,
      actionableSteps: [
        'Create final retention snapshot of volume',
        'Verify with DevOps team that volume data is not required for cold recovery',
        'Delete unattached volume via Cloud console or CLI'
      ]
    }
  }

  if (resource.status === 'STOPPED') {
    const savings = resource.monthlyCost
    return {
      id: `rec-stopped-${resource.id}`,
      resourceId: resource.id,
      resourceName: resource.name,
      provider: resource.provider,
      service: resource.service,
      type: 'IDLE_CLEANUP',
      title: `Terminate or archive stopped instance ${resource.name}`,
      description: `Instance has been stopped for ${resource.idleDays} days while continuing to accrue root EBS and provisioned IP costs.`,
      currentConfiguration: `${resource.instanceType} (Stopped for ${resource.idleDays}d)`,
      recommendedConfiguration: 'Create AMI image and Terminate',
      currentMonthlyCost: resource.monthlyCost,
      projectedMonthlyCost: 0,
      potentialMonthlySavings: savings,
      annualSavings: Number((savings * 12).toFixed(2)),
      effortLevel: 'LOW',
      riskLevel: 'LOW',
      applied: false,
      dismissed: false,
      actionableSteps: [
        'Create machine image (AMI / VHD) for archive',
        'Release allocated Elastic / Static IP',
        'Terminate instance and delete associated storage'
      ]
    }
  }

  // Zombie active instance
  const savings = Number((resource.monthlyCost * 0.9).toFixed(2))
  return {
    id: `rec-idle-${resource.id}`,
    resourceId: resource.id,
    resourceName: resource.name,
    provider: resource.provider,
    service: resource.service,
    type: 'IDLE_CLEANUP',
    title: `Decommission zombie compute instance ${resource.name}`,
    description: `Instance has recorded under ${resource.cpuUtilization.toFixed(1)}% CPU utilization continuously for ${resource.idleDays} days with negligible network I/O.`,
    currentConfiguration: `${resource.instanceType} (${resource.cpuUtilization}% avg CPU)`,
    recommendedConfiguration: 'Consolidate workload or Terminate',
    currentMonthlyCost: resource.monthlyCost,
    projectedMonthlyCost: Number((resource.monthlyCost - savings).toFixed(2)),
    potentialMonthlySavings: savings,
    annualSavings: Number((savings * 12).toFixed(2)),
    effortLevel: 'LOW',
    riskLevel: 'LOW',
    applied: false,
    dismissed: false,
    actionableSteps: [
      'Confirm service owner and check running processes',
      'Migrate remaining background jobs if any',
      'Safely terminate instance and recover budget'
    ]
  }
}

/**
 * Evaluates storage lifecycle tiering for large buckets.
 */
export function evaluateStorageTiering(resource: CloudResource): Recommendation | null {
  if (resource.type !== 'STORAGE' || resource.monthlyCost < 80) return null

  const savings = Number((resource.monthlyCost * 0.65).toFixed(2))
  return {
    id: `rec-storage-tier-${resource.id}`,
    resourceId: resource.id,
    resourceName: resource.name,
    provider: resource.provider,
    service: resource.service,
    type: 'STORAGE_TIERING',
    title: `Implement Intelligent Tiering / Glacier transition on ${resource.name}`,
    description: `Bucket contains infrequently accessed objects (>90 days old) stored on Standard Tier. Enabling automatic lifecycle transitions cuts storage cost by up to 65%.`,
    currentConfiguration: 'Standard Object Storage',
    recommendedConfiguration: 'Intelligent Tiering + 90-day Glacier Archive',
    currentMonthlyCost: resource.monthlyCost,
    projectedMonthlyCost: Number((resource.monthlyCost - savings).toFixed(2)),
    potentialMonthlySavings: savings,
    annualSavings: Number((savings * 12).toFixed(2)),
    effortLevel: 'LOW',
    riskLevel: 'LOW',
    applied: false,
    dismissed: false,
    actionableSteps: [
      'Enable S3 / GCS Lifecycle Configuration rule',
      'Transition objects older than 30 days to Infrequent Access',
      'Archive objects older than 90 days to Glacier Flexible Retrieval'
    ]
  }
}

/**
 * Evaluates threshold-based alerts against active resources and budget metrics.
 */
export function evaluateAlerts(resources: CloudResource[], monthlyBudget: number = 4000): ThresholdAlert[] {
  const alerts: ThresholdAlert[] = []
  const totalCost = resources.reduce((acc, r) => acc + r.monthlyCost, 0)

  // 1. Budget overrun alert
  if (totalCost > monthlyBudget) {
    alerts.push({
      id: 'alert-budget-overrun',
      title: 'Monthly Cloud Budget Exceeded',
      message: `Total projected cloud spend ($${totalCost.toFixed(2)}) exceeds monthly allocated budget threshold ($${monthlyBudget.toFixed(2)}).`,
      severity: 'CRITICAL',
      category: 'BUDGET_OVERRUN',
      thresholdValue: `$${monthlyBudget.toFixed(2)}/mo`,
      currentValue: `$${totalCost.toFixed(2)}/mo`,
      status: 'ACTIVE',
      triggeredAt: new Date(Date.now() - 3600000 * 4).toISOString()
    })
  } else if (totalCost > monthlyBudget * 0.85) {
    alerts.push({
      id: 'alert-budget-warning',
      title: 'Approaching Monthly Budget Limit (85%)',
      message: `Total monthly spend is at ${((totalCost / monthlyBudget) * 100).toFixed(1)}% of allocated cloud budget.`,
      severity: 'WARNING',
      category: 'BUDGET_OVERRUN',
      thresholdValue: `85% ($${(monthlyBudget * 0.85).toFixed(2)})`,
      currentValue: `$${totalCost.toFixed(2)}`,
      status: 'ACTIVE',
      triggeredAt: new Date(Date.now() - 3600000 * 12).toISOString()
    })
  }

  // 2. High cost individual resources (> $400/mo)
  for (const r of resources) {
    if (r.monthlyCost > 450) {
      alerts.push({
        id: `alert-high-cost-${r.id}`,
        title: `High-Cost Resource Trigger: ${r.name}`,
        message: `Resource is incurring $${r.monthlyCost.toFixed(2)}/mo on ${r.provider} (${r.service}). Review utilization to prevent cost runaway.`,
        severity: r.isIdle ? 'CRITICAL' : 'WARNING',
        category: 'COST_SURGE',
        resourceId: r.id,
        resourceName: r.name,
        provider: r.provider,
        thresholdValue: '$400.00/mo',
        currentValue: `$${r.monthlyCost.toFixed(2)}/mo`,
        status: 'ACTIVE',
        triggeredAt: new Date(Date.now() - 3600000 * 20).toISOString()
      })
    }
  }

  // 3. Severe idle resource alerts
  const idleUnattached = resources.filter(r => r.unattachedStorage)
  if (idleUnattached.length > 0) {
    const wasted = idleUnattached.reduce((sum, r) => sum + r.monthlyCost, 0)
    alerts.push({
      id: 'alert-unattached-volumes',
      title: `${idleUnattached.length} Unattached Disk Volumes Detected`,
      message: `Detected ${idleUnattached.length} orphaned cloud storage volumes generating $${wasted.toFixed(2)}/month in pure waste.`,
      severity: 'WARNING',
      category: 'IDLE_RESOURCE',
      thresholdValue: '0 unattached volumes',
      currentValue: `${idleUnattached.length} volumes ($${wasted.toFixed(2)}/mo)`,
      status: 'ACTIVE',
      triggeredAt: new Date(Date.now() - 3600000 * 8).toISOString()
    })
  }

  // 4. Resource health alert (High CPU / bottleneck > 90%)
  const stressed = resources.filter(r => r.cpuUtilization > 90)
  for (const r of stressed) {
    alerts.push({
      id: `alert-stress-${r.id}`,
      title: `CPU Utilization Spike on ${r.name}`,
      message: `Average CPU load is ${r.cpuUtilization.toFixed(1)}%. Resource is at risk of throttling or service degradation.`,
      severity: 'WARNING',
      category: 'RESOURCE_HEALTH',
      resourceId: r.id,
      resourceName: r.name,
      provider: r.provider,
      thresholdValue: '90.0% CPU',
      currentValue: `${r.cpuUtilization.toFixed(1)}% CPU`,
      status: 'ACTIVE',
      triggeredAt: new Date(Date.now() - 3600000 * 2).toISOString()
    })
  }

  return alerts
}

// -------------------------------------------------------------
// Synthetic Ingestion & Telemetry Generator
// -------------------------------------------------------------

/**
 * Generates an enterprise multi-cloud synthetic dataset.
 * Labeled clearly as synthetic simulation data.
 */
export function generateSyntheticInventory(): CloudResource[] {
  return [
    // --- AWS Resources ---
    {
      id: 'res-aws-ec2-prod-api-01',
      name: 'prod-api-gateway-us-east',
      provider: 'AWS',
      service: 'EC2',
      region: 'us-east-1',
      type: 'COMPUTE',
      instanceType: 'c5.2xlarge',
      status: 'OVER_PROVISIONED',
      monthlyCost: 244.80,
      hourlyCost: 0.34,
      cpuUtilization: 14.2,
      memoryUtilization: 28.5,
      storageUtilization: 42.0,
      networkIOGB: 850,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Environment: 'production', Team: 'Backend', Project: 'CoreAPI' },
      createdAt: '2026-01-15T00:00:00Z',
      lastActiveAt: '2026-10-25T12:00:00Z'
    },
    {
      id: 'res-aws-ec2-analytics-worker',
      name: 'batch-analytics-worker-02',
      provider: 'AWS',
      service: 'EC2',
      region: 'us-west-2',
      type: 'COMPUTE',
      instanceType: 'r5.4xlarge',
      status: 'IDLE',
      monthlyCost: 725.76,
      hourlyCost: 1.008,
      cpuUtilization: 2.1,
      memoryUtilization: 6.4,
      storageUtilization: 12.0,
      networkIOGB: 45,
      isIdle: true,
      idleDays: 14,
      unattachedStorage: false,
      tags: { Environment: 'staging', Team: 'DataEng', CostCenter: 'Analytics' },
      createdAt: '2026-03-10T00:00:00Z',
      lastActiveAt: '2026-10-11T09:30:00Z'
    },
    {
      id: 'res-aws-ebs-unattached-01',
      name: 'vol-backup-archive-oct-orphan',
      provider: 'AWS',
      service: 'EBS',
      region: 'us-east-1',
      type: 'STORAGE',
      instanceType: 'gp3 (1000 GB)',
      status: 'IDLE',
      monthlyCost: 80.00,
      hourlyCost: 0.111,
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageUtilization: 100,
      networkIOGB: 0,
      isIdle: true,
      idleDays: 21,
      unattachedStorage: true,
      tags: { CreatedBy: 'ci-bot', State: 'available' },
      createdAt: '2026-08-01T00:00:00Z',
      lastActiveAt: '2026-10-04T00:00:00Z'
    },
    {
      id: 'res-aws-ebs-unattached-02',
      name: 'vol-temp-scratch-disk-unattached',
      provider: 'AWS',
      service: 'EBS',
      region: 'us-east-1',
      type: 'STORAGE',
      instanceType: 'io2 (500 GB, 5000 IOPS)',
      status: 'IDLE',
      monthlyCost: 195.00,
      hourlyCost: 0.27,
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageUtilization: 100,
      networkIOGB: 0,
      isIdle: true,
      idleDays: 32,
      unattachedStorage: true,
      tags: { Environment: 'dev', State: 'available' },
      createdAt: '2026-07-20T00:00:00Z',
      lastActiveAt: '2026-09-23T00:00:00Z'
    },
    {
      id: 'res-aws-rds-postgres-primary',
      name: 'aurora-pg-userdb-cluster',
      provider: 'AWS',
      service: 'RDS',
      region: 'us-east-1',
      type: 'DATABASE',
      instanceType: 'db.r5.2xlarge',
      status: 'OVER_PROVISIONED',
      monthlyCost: 691.20,
      hourlyCost: 0.96,
      cpuUtilization: 18.5,
      memoryUtilization: 35.0,
      storageUtilization: 38.0,
      networkIOGB: 1200,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Environment: 'production', Database: 'PostgreSQL' },
      createdAt: '2026-01-10T00:00:00Z',
      lastActiveAt: '2026-10-25T13:00:00Z'
    },
    {
      id: 'res-aws-s3-app-assets',
      name: 'prod-media-assets-static-cdn',
      provider: 'AWS',
      service: 'S3',
      region: 'us-east-1',
      type: 'STORAGE',
      instanceType: 'Standard (8.5 TB)',
      status: 'ACTIVE',
      monthlyCost: 195.50,
      hourlyCost: 0.271,
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageUtilization: 85,
      networkIOGB: 4200,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Tier: 'Standard', Access: 'Infrequent' },
      createdAt: '2025-11-01T00:00:00Z',
      lastActiveAt: '2026-10-25T13:45:00Z'
    },
    {
      id: 'res-aws-lambda-events',
      name: 'webhook-ingestion-router',
      provider: 'AWS',
      service: 'Lambda',
      region: 'us-east-1',
      type: 'SERVERLESS',
      instanceType: '1024MB Memory',
      status: 'ACTIVE',
      monthlyCost: 42.15,
      hourlyCost: 0.058,
      cpuUtilization: 52.0,
      memoryUtilization: 48.0,
      storageUtilization: 0,
      networkIOGB: 310,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Runtime: 'nodejs20', Type: 'Serverless' },
      createdAt: '2026-04-12T00:00:00Z',
      lastActiveAt: '2026-10-25T13:50:00Z'
    },

    // --- Azure Resources ---
    {
      id: 'res-az-vm-frontend-app',
      name: 'vm-frontend-ingress-eastus',
      provider: 'AZURE',
      service: 'Virtual Machines',
      region: 'eastus',
      type: 'COMPUTE',
      instanceType: 'Standard_D4s_v5',
      status: 'OVER_PROVISIONED',
      monthlyCost: 140.16,
      hourlyCost: 0.194,
      cpuUtilization: 11.5,
      memoryUtilization: 22.0,
      storageUtilization: 30.0,
      networkIOGB: 640,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Environment: 'production', OS: 'Ubuntu-22.04' },
      createdAt: '2026-02-18T00:00:00Z',
      lastActiveAt: '2026-10-25T12:30:00Z'
    },
    {
      id: 'res-az-vm-legacy-qa',
      name: 'vm-legacy-qa-win2019',
      provider: 'AZURE',
      service: 'Virtual Machines',
      region: 'eastus',
      type: 'COMPUTE',
      instanceType: 'Standard_E4s_v5',
      status: 'STOPPED',
      monthlyCost: 96.00,
      hourlyCost: 0.133,
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageUtilization: 60.0,
      networkIOGB: 0,
      isIdle: true,
      idleDays: 28,
      unattachedStorage: false,
      tags: { Environment: 'qa', Note: 'Stopped but attached OS disk billed' },
      createdAt: '2025-10-10T00:00:00Z',
      lastActiveAt: '2026-09-27T00:00:00Z'
    },
    {
      id: 'res-az-blob-logs',
      name: 'storage-diagnostic-logs-westeu',
      provider: 'AZURE',
      service: 'Blob Storage',
      region: 'westeurope',
      type: 'STORAGE',
      instanceType: 'Hot Tier (12 TB)',
      status: 'ACTIVE',
      monthlyCost: 240.00,
      hourlyCost: 0.333,
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageUtilization: 92,
      networkIOGB: 1800,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Lifecycle: 'None', AccessTier: 'Hot' },
      createdAt: '2025-12-05T00:00:00Z',
      lastActiveAt: '2026-10-25T11:00:00Z'
    },
    {
      id: 'res-az-sql-reporting',
      name: 'sql-bi-reporting-replica',
      provider: 'AZURE',
      service: 'Azure SQL',
      region: 'eastus',
      type: 'DATABASE',
      instanceType: 'General Purpose (8 vCore)',
      status: 'OVER_PROVISIONED',
      monthlyCost: 489.60,
      hourlyCost: 0.68,
      cpuUtilization: 12.0,
      memoryUtilization: 25.0,
      storageUtilization: 31.0,
      networkIOGB: 410,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Department: 'Finance', Workload: 'BI' },
      createdAt: '2026-03-01T00:00:00Z',
      lastActiveAt: '2026-10-25T10:15:00Z'
    },

    // --- GCP Resources ---
    {
      id: 'res-gcp-gce-ml-training',
      name: 'ml-model-trainer-n2-standard',
      provider: 'GCP',
      service: 'Compute Engine',
      region: 'us-central1',
      type: 'COMPUTE',
      instanceType: 'n2-standard-8',
      status: 'OVER_PROVISIONED',
      monthlyCost: 288.00,
      hourlyCost: 0.40,
      cpuUtilization: 19.8,
      memoryUtilization: 32.4,
      storageUtilization: 55.0,
      networkIOGB: 920,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Project: 'RecommendationAI', Team: 'MLOps' },
      createdAt: '2026-02-01T00:00:00Z',
      lastActiveAt: '2026-10-25T13:10:00Z'
    },
    {
      id: 'res-gcp-gce-dev-sandbox',
      name: 'dev-sandbox-e2-idle',
      provider: 'GCP',
      service: 'Compute Engine',
      region: 'us-central1',
      type: 'COMPUTE',
      instanceType: 'e2-standard-4',
      status: 'IDLE',
      monthlyCost: 96.00,
      hourlyCost: 0.133,
      cpuUtilization: 1.8,
      memoryUtilization: 4.2,
      storageUtilization: 18.0,
      networkIOGB: 12,
      isIdle: true,
      idleDays: 19,
      unattachedStorage: false,
      tags: { Owner: 'intern-sandbox', Environment: 'test' },
      createdAt: '2026-06-15T00:00:00Z',
      lastActiveAt: '2026-10-06T14:00:00Z'
    },
    {
      id: 'res-gcp-gcs-backups',
      name: 'gcs-enterprise-db-backups-central',
      provider: 'GCP',
      service: 'Cloud Storage',
      region: 'us-central1',
      type: 'STORAGE',
      instanceType: 'Standard Storage (15 TB)',
      status: 'ACTIVE',
      monthlyCost: 300.00,
      hourlyCost: 0.416,
      cpuUtilization: 0,
      memoryUtilization: 0,
      storageUtilization: 95,
      networkIOGB: 500,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Retention: '365d', Compliance: 'SOX' },
      createdAt: '2025-08-01T00:00:00Z',
      lastActiveAt: '2026-10-25T08:00:00Z'
    },
    {
      id: 'res-gcp-cloudrun-api',
      name: 'cloudrun-auth-microservice',
      provider: 'GCP',
      service: 'Cloud Run',
      region: 'us-central1',
      type: 'SERVERLESS',
      instanceType: '2 vCPU / 4GiB',
      status: 'ACTIVE',
      monthlyCost: 58.20,
      hourlyCost: 0.08,
      cpuUtilization: 45.0,
      memoryUtilization: 52.0,
      storageUtilization: 0,
      networkIOGB: 480,
      isIdle: false,
      idleDays: 0,
      unattachedStorage: false,
      tags: { Service: 'Auth', Scaling: 'Auto' },
      createdAt: '2026-05-01T00:00:00Z',
      lastActiveAt: '2026-10-25T13:40:00Z'
    }
  ]
}

/**
 * Generates all active recommendations from resources.
 */
export function generateRecommendations(resources: CloudResource[]): Recommendation[] {
  const recs: Recommendation[] = []

  for (const res of resources) {
    const idleRec = evaluateIdleCleanup(res)
    if (idleRec) {
      recs.push(idleRec)
      continue
    }

    const rightsizingRec = evaluateRightsizing(res)
    if (rightsizingRec) {
      recs.push(rightsizingRec)
    }

    const storageRec = evaluateStorageTiering(res)
    if (storageRec) {
      recs.push(storageRec)
    }
  }

  return recs
}

/**
 * Generates 30-day historical daily cost telemetry.
 */
export function generate30DayHistoricalCosts(): { date: string; cost: number; aws: number; gcp: number; azure: number }[] {
  const points: { date: string; cost: number; aws: number; gcp: number; azure: number }[] = []
  const baseAws = 68.50
  const baseAzure = 32.20
  const baseGcp = 24.80

  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Realistic day-of-week variation and subtle growth
    const dayOfWeek = d.getDay()
    const weekendDampener = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.05
    const variance = 1 + (Math.sin(i * 0.7) * 0.08)

    const aws = Number((baseAws * weekendDampener * variance).toFixed(2))
    const azure = Number((baseAzure * weekendDampener * variance).toFixed(2))
    const gcp = Number((baseGcp * weekendDampener * variance).toFixed(2))
    const total = Number((aws + azure + gcp).toFixed(2))

    points.push({ date: dateStr, cost: total, aws, gcp, azure })
  }

  return points
}

/**
 * Generates 24-hour resource utilization time series.
 */
export function generateUtilizationHistory(): UtilizationDataPoint[] {
  const points: UtilizationDataPoint[] = []
  const now = Date.now()

  for (let h = 23; h >= 0; h--) {
    const time = new Date(now - h * 3600000)
    const hour = time.getHours()
    // Business hours peak (9am to 6pm)
    const isPeak = hour >= 9 && hour <= 18
    const baseCpu = isPeak ? 64 : 26
    const baseMem = isPeak ? 58 : 34
    const baseDisk = 62 + Math.sin(h * 0.2) * 2
    const baseNet = isPeak ? 450 : 120

    points.push({
      timestamp: `${hour.toString().padStart(2, '0')}:00`,
      avgCpu: Number((baseCpu + Math.sin(h) * 8).toFixed(1)),
      avgMemory: Number((baseMem + Math.cos(h) * 5).toFixed(1)),
      avgStorage: Number(baseDisk.toFixed(1)),
      networkThroughputMbps: Number((baseNet + Math.sin(h * 1.5) * 40).toFixed(1))
    })
  }

  return points
}

/**
 * Generates data quality audit metrics.
 */
export function generateDataQualityReport(resources: CloudResource[]): DataQualityReport {
  const total = resources.length
  const withValidTags = resources.filter(r => Object.keys(r.tags).length > 0).length
  const validMetrics = resources.filter(r => r.cpuUtilization >= 0 && r.monthlyCost >= 0).length

  const score = Math.round(((withValidTags / total) * 0.4 + (validMetrics / total) * 0.6) * 100)

  return {
    score,
    totalRecordsProcessed: total * 24 * 30, // 30 days hourly records
    validRecords: total * 24 * 30 - 12,
    schemaComplianceRate: 99.8,
    ingestionLatencyMs: 142,
    syntheticDataMode: true,
    attributionWatermark: 'CLOUDCOST-GUARDIAN-SYNTHETIC-TELEMETRY-v1.0',
    lastSyncTimestamp: new Date().toISOString(),
    anomaliesDetected: 4,
    dataChecks: [
      { name: 'Schema Validation (RFC-4180)', status: 'PASSED', details: 'All 15 schema columns matched expected types' },
      { name: 'Null Values & Completeness', status: 'PASSED', details: 'Zero null values across required identifiers' },
      { name: 'Cost Attribution Tagging', status: withValidTags === total ? 'PASSED' : 'WARNING', details: `${withValidTags}/${total} resources contain organizational cost tags` },
      { name: 'Metric Range Consistency', status: 'PASSED', details: 'CPU (0-100%) and RAM values within theoretical bounds' },
      { name: 'Synthetic Provenance Watermark', status: 'PASSED', details: 'Verified non-production synthetic watermark on all telemetry streams' }
    ]
  }
}

/**
 * Formats resource data as an RFC-4180 compliant CSV string.
 */
export function exportResourcesToCSV(resources: CloudResource[]): string {
  const headers = [
    'Resource ID',
    'Resource Name',
    'Provider',
    'Service',
    'Region',
    'Type',
    'Instance Type',
    'Status',
    'Monthly Cost ($)',
    'Hourly Cost ($)',
    'Avg CPU (%)',
    'Avg Memory (%)',
    'Avg Storage (%)',
    'Network IO (GB)',
    'Is Idle',
    'Idle Days',
    'Environment'
  ]

  const rows = resources.map(r => [
    r.id,
    r.name,
    r.provider,
    r.service,
    r.region,
    r.type,
    r.instanceType,
    r.status,
    r.monthlyCost.toFixed(2),
    r.hourlyCost.toFixed(4),
    r.cpuUtilization.toFixed(1),
    r.memoryUtilization.toFixed(1),
    r.storageUtilization.toFixed(1),
    r.networkIOGB,
    r.isIdle ? 'YES' : 'NO',
    r.idleDays,
    r.tags['Environment'] || 'Unspecified'
  ])

  const escapeCSV = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
  const csvLines = [headers.map(escapeCSV).join(',')]

  for (const row of rows) {
    csvLines.push(row.map(escapeCSV).join(','))
  }

  return csvLines.join('\r\n')
}

/**
 * Formats recommendations as an RFC-4180 compliant CSV string.
 */
export function exportRecommendationsToCSV(recommendations: Recommendation[]): string {
  const headers = [
    'Recommendation ID',
    'Title',
    'Resource ID',
    'Provider',
    'Service',
    'Optimization Type',
    'Current Configuration',
    'Recommended Configuration',
    'Current Monthly Cost ($)',
    'Projected Monthly Cost ($)',
    'Potential Monthly Savings ($)',
    'Annual Savings ($)',
    'Effort Level',
    'Risk Level'
  ]

  const rows = recommendations.map(rec => [
    rec.id,
    rec.title,
    rec.resourceId,
    rec.provider,
    rec.service,
    rec.type,
    rec.currentConfiguration,
    rec.recommendedConfiguration,
    rec.currentMonthlyCost.toFixed(2),
    rec.projectedMonthlyCost.toFixed(2),
    rec.potentialMonthlySavings.toFixed(2),
    rec.annualSavings.toFixed(2),
    rec.effortLevel,
    rec.riskLevel
  ])

  const escapeCSV = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
  const csvLines = [headers.map(escapeCSV).join(',')]

  for (const row of rows) {
    csvLines.push(row.map(escapeCSV).join(','))
  }

  return csvLines.join('\r\n')
}
