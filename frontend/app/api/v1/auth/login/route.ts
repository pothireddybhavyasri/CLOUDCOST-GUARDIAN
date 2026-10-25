import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Support demo/guest login or valid format email
    const name = email ? email.split('@')[0] : 'Guardian Engineer'
    const token = `cg_token_${Buffer.from(JSON.stringify({ email, time: Date.now() })).toString('base64')}`

    return NextResponse.json({
      token,
      user: {
        id: 'user-guardian-01',
        email: email || 'demo@cloudcostguardian.internal',
        name: name.charAt(0).toUpperCase() + name.slice(1)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid login request' },
      { status: 400 }
    )
  }
}
