import { NextResponse } from 'next/server'
import {
  generateSyntheticInventory,
  generateRecommendations,
  exportResourcesToCSV,
  exportRecommendationsToCSV
} from '@/lib/guardian-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'resources'

  const inventory = generateSyntheticInventory()

  if (type === 'recommendations') {
    const recs = generateRecommendations(inventory)
    const csvData = exportRecommendationsToCSV(recs)

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="cloudcost-guardian-recommendations-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  }

  // Default: export resource inventory
  const csvData = exportResourcesToCSV(inventory)
  return new NextResponse(csvData, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cloudcost-guardian-inventory-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
