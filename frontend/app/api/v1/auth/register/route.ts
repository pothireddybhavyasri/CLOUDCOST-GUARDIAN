import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email } = body

    const token = `cg_token_${Buffer.from(JSON.stringify({ email, time: Date.now() })).toString('base64')}`

    return NextResponse.json({
      token,
      user: {
        id: `user-${Date.now().toString(36)}`,
        email: email || 'user@cloudcostguardian.internal',
        name: name || 'Guardian User'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }
}
