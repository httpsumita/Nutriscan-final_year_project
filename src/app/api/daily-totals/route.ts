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

    // Get calorie logs for the day
    const calorieEntries = await prisma.calorieLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      }
    })

    // Get water logs for the day
    const waterEntries = await prisma.waterIntake.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      }
    })

    // Get scans for the day
    const scans = await prisma.scan.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: dayStart,
          lt: dayEnd
        }
      }
    })

    const totalCalories = calorieEntries.reduce((sum, e) => sum + e.calories, 0)
    const totalWater = waterEntries.reduce((sum, e) => sum + e.amount, 0)

    return NextResponse.json({
      ok: true,
      totals: {
        calories: totalCalories,
        calorieGoal: 2000,
        caloriesRemaining: Math.max(0, 2000 - totalCalories),
        water: totalWater,
        waterGoal: 2000,
        waterRemaining: Math.max(0, 2000 - totalWater),
        scans: scans.length,
        calorieEntries: calorieEntries.length,
        waterEntries: waterEntries.length
      }
    })
  } catch (error) {
    console.error('Get daily totals error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
