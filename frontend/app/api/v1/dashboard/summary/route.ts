import { NextResponse } from 'next/server'
import {
  generateSyntheticInventory,
  generateRecommendations,
  generate30DayHistoricalCosts,
  evaluateAlerts
} from '@/lib/guardian-engine'

export async function GET() {
  const inventory = generateSyntheticInventory()
  const recommendations = generateRecommendations(inventory)
  const dailyCosts = generate30DayHistoricalCosts()
  const alerts = evaluateAlerts(inventory, 3200)

  const totalCost = Number(inventory.reduce((sum, r) => sum + r.monthlyCost, 0).toFixed(2))
  const potentialSavings = Number(recommendations.reduce((sum, r) => sum + r.potentialMonthlySavings, 0).toFixed(2))

  // Aggregate cost by service
  const costByService: Record<string, number> = {}
  for (const res of inventory) {
    costByService[res.service] = Number(((costByService[res.service] || 0) + res.monthlyCost).toFixed(2))
  }

  // Aggregate cost by provider
  const costByProvider: Record<string, number> = {}
  for (const res of inventory) {
    costByProvider[res.provider] = Number(((costByProvider[res.provider] || 0) + res.monthlyCost).toFixed(2))
  }

  const topRecommendations = recommendations
    .sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings)
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      title: r.title,
      potential_savings: r.potentialMonthlySavings,
      type: r.type,
      provider: r.provider,
      effort: r.effortLevel
    }))

  const idleCount = inventory.filter(r => r.isIdle).length

  return NextResponse.json({
    total_cost: totalCost,
    cost_by_service: costByService,
    cost_by_provider: costByProvider,
    recommendations_count: recommendations.length,
    potential_savings: potentialSavings,
    unread_alerts: alerts.length,
    daily_costs: dailyCosts,
    top_recommendations: topRecommendations,
    total_resources: inventory.length,
    idle_resources_count: idleCount,
    active_resources_count: inventory.length - idleCount,
    data_mode: 'SYNTHETIC_SIMULATION',
    updated_at: new Date().toISOString()
  })
}
