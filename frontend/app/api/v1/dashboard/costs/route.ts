import { NextResponse } from 'next/server'
import { generate30DayHistoricalCosts, generateSyntheticInventory } from '@/lib/guardian-engine'

export async function GET() {
  const dailyCosts = generate30DayHistoricalCosts()
  const inventory = generateSyntheticInventory()

  const providerBreakdown = {
    AWS: inventory.filter(r => r.provider === 'AWS').reduce((s, r) => s + r.monthlyCost, 0),
    AZURE: inventory.filter(r => r.provider === 'AZURE').reduce((s, r) => s + r.monthlyCost, 0),
    GCP: inventory.filter(r => r.provider === 'GCP').reduce((s, r) => s + r.monthlyCost, 0)
  }

  return NextResponse.json({
    history: dailyCosts,
    provider_breakdown: providerBreakdown,
    currency: 'USD'
  })
}
