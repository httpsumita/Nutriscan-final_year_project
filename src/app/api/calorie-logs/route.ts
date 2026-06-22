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

    // Get start and end of day (use UTC to avoid timezone issues)
    const date = new Date(dateParam)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const day = date.getUTCDate()
    
    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
    const dayEnd = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0))

    const entries = await prisma.calorieLog.findMany({
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
        foodName: e.foodName,
        category: e.category,
        calories: e.calories,
        date: e.date.toISOString()
      }))
    })
  } catch (error) {
    console.error('Get calorie logs error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
