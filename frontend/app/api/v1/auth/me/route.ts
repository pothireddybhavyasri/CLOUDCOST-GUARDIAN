import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  return NextResponse.json({
    user: {
      id: 'user-guardian-01',
      email: 'demo@cloudcostguardian.internal',
      name: 'Guardian Engineer',
      role: 'Cloud Architect',
      organization: 'CloudCost Guardian Lab'
    }
  })
}
