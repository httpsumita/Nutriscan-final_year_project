import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { ok: false, error: 'Date parameter required' },
        { status: 400 }
      )
    }

    // Get start and end of day
    const date = new Date(dateParam)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const entries = await prisma.waterIntake.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      entries: entries.map(e => ({
        id: e.id,
        amount: e.amount,
        date: e.date.toISOString()
      }))
    })
  } catch (error) {
    console.error('Get water logs error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
