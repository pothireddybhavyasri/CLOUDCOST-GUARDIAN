import { NextResponse } from 'next/server'
import { generateSyntheticInventory, evaluateAlerts } from '@/lib/guardian-engine'

// In-memory alert state storage for active session
let alertStateCache: ReturnType<typeof evaluateAlerts> | null = null

function getAlerts() {
  if (!alertStateCache) {
    const inventory = generateSyntheticInventory()
    alertStateCache = evaluateAlerts(inventory, 3200)
  }
  return alertStateCache
}

export async function GET() {
  const alerts = getAlerts()
  return NextResponse.json({
    count: alerts.length,
    critical_count: alerts.filter(a => a.severity === 'CRITICAL').length,
    warning_count: alerts.filter(a => a.severity === 'WARNING').length,
    alerts
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alertId, action } = body

    const alerts = getAlerts()
    const target = alerts.find(a => a.id === alertId)

    if (!target) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    if (action === 'ACKNOWLEDGE') {
      target.status = 'ACKNOWLEDGED'
    } else if (action === 'RESOLVE') {
      target.status = 'RESOLVED'
    }

    return NextResponse.json({
      success: true,
      alert: target
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid alert update request' }, { status: 400 })
  }
}
