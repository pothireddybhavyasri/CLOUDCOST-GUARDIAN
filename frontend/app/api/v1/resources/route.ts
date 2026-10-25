import { NextResponse } from 'next/server'
import { generateSyntheticInventory, CloudProvider, ResourceStatus, ResourceType } from '@/lib/guardian-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')?.toUpperCase() as CloudProvider | undefined
  const status = searchParams.get('status')?.toUpperCase() as ResourceStatus | undefined
  const type = searchParams.get('type')?.toUpperCase() as ResourceType | undefined
  const search = searchParams.get('search')?.toLowerCase()
  const idleOnly = searchParams.get('idle') === 'true'

  let inventory = generateSyntheticInventory()

  if (provider) {
    inventory = inventory.filter(r => r.provider === provider)
  }
  if (status) {
    inventory = inventory.filter(r => r.status === status)
  }
  if (type) {
    inventory = inventory.filter(r => r.type === type)
  }
  if (idleOnly) {
    inventory = inventory.filter(r => r.isIdle)
  }
  if (search) {
    inventory = inventory.filter(r =>
      r.name.toLowerCase().includes(search) ||
      r.service.toLowerCase().includes(search) ||
      r.region.toLowerCase().includes(search) ||
      r.instanceType.toLowerCase().includes(search)
    )
  }

  const totalCost = inventory.reduce((sum, r) => sum + r.monthlyCost, 0)

  return NextResponse.json({
    count: inventory.length,
    total_filtered_cost: Number(totalCost.toFixed(2)),
    resources: inventory
  })
}
