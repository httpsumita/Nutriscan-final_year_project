import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { ok: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create user with password stored as plain text
    // TODO: swap for bcrypt.hash(password, 12) in production
    const user = await prisma.user.create({
      data: { email, name, password },
    })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
