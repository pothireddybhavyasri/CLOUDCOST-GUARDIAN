import { NextResponse } from 'next/server'
import { generateSyntheticInventory, generateRecommendations } from '@/lib/guardian-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const provider = searchParams.get('provider')?.toUpperCase()

  const inventory = generateSyntheticInventory()
  let recs = generateRecommendations(inventory)

  if (type) {
    recs = recs.filter(r => r.type === type)
  }
  if (provider) {
    recs = recs.filter(r => r.provider === provider)
  }

  const totalMonthlySavings = recs.reduce((sum, r) => sum + r.potentialMonthlySavings, 0)
  const totalAnnualSavings = recs.reduce((sum, r) => sum + r.annualSavings, 0)

  return NextResponse.json({
    count: recs.length,
    total_potential_monthly_savings: Number(totalMonthlySavings.toFixed(2)),
    total_potential_annual_savings: Number(totalAnnualSavings.toFixed(2)),
    recommendations: recs
  })
}
