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
    const date = searchParams.get('date')

    // Parse date or use today
    const targetDate = date ? new Date(date) : new Date()
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

    // Get daily log
    const dailyLog = await prisma.dailyLog.findFirst({
      where: {
        userId: session.user.id,
        date: dayStart
      }
    })

    if (!dailyLog) {
      return NextResponse.json({
        ok: true,
        dailyIntake: {
          date: dayStart,
          consumedItems: [],
          hormonalLoadScore: 50,
          itemCount: 0
        }
      })
    }

    // Parse consumed items
    const parsedItems = (dailyLog.consumedItems || []).map(item => {
      const [productName, score] = item.split('|')
      return {
        productName,
        score: parseFloat(score) || 5
      }
    })

    return NextResponse.json({
      ok: true,
      dailyIntake: {
        date: dayStart,
        consumedItems: parsedItems,
        hormonalLoadScore: dailyLog.hormonalLoadScore,
        itemCount: parsedItems.length,
        averageScore: parsedItems.length > 0 
          ? (parsedItems.reduce((sum, item) => sum + item.score, 0) / parsedItems.length).toFixed(1)
          : 0
      }
    })
  } catch (error) {
    console.error('Daily intake API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
