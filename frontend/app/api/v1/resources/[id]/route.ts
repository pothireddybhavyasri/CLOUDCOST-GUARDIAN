import { NextResponse } from 'next/server'
import { generateSyntheticInventory } from '@/lib/guardian-engine'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const inventory = generateSyntheticInventory()
  const resource = inventory.find(r => r.id === id)

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  return NextResponse.json({
    resource,
    telemetry: {
      metrics: {
        cpu: resource.cpuUtilization,
        memory: resource.memoryUtilization,
        storage: resource.storageUtilization,
        networkIOGB: resource.networkIOGB
      },
      health: resource.isIdle ? 'IDLE' : resource.cpuUtilization > 85 ? 'HIGH_LOAD' : 'HEALTHY'
    }
  })
}
