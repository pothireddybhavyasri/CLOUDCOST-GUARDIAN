import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    platform: 'CloudCost Guardian',
    version: '1.0.0',
    mode: 'autonomous-synthetic-telemetry',
    timestamp: new Date().toISOString()
  })
}
