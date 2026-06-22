import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { amount } = body

    if (amount === undefined || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create water intake entry
    const waterLog = await prisma.waterIntake.create({
      data: {
        userId: session.user.id,
        amount: parseInt(amount),
        date: new Date()
      }
    })

    return NextResponse.json({
      ok: true,
      waterLog
    })
  } catch (error) {
    console.error('Log water API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
