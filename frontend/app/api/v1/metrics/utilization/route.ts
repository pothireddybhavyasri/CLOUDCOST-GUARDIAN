import { NextResponse } from 'next/server'
import { generateUtilizationHistory } from '@/lib/guardian-engine'

export async function GET() {
  const timeSeries = generateUtilizationHistory()
  return NextResponse.json({
    interval: '1h',
    dataPoints: timeSeries,
    summary: {
      peakCpu: Math.max(...timeSeries.map(p => p.avgCpu)),
      averageCpu: Number((timeSeries.reduce((s, p) => s + p.avgCpu, 0) / timeSeries.length).toFixed(1)),
      averageMemory: Number((timeSeries.reduce((s, p) => s + p.avgMemory, 0) / timeSeries.length).toFixed(1)),
      averageStorage: Number((timeSeries.reduce((s, p) => s + p.avgStorage, 0) / timeSeries.length).toFixed(1))
    }
  })
}
