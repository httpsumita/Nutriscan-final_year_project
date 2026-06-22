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
    const { foodName, category, calories } = body

    if (!foodName || !category || calories === undefined) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create calorie log entry
    const calorieLog = await prisma.calorieLog.create({
      data: {
        userId: session.user.id,
        foodName,
        category,
        calories: parseInt(calories),
        date: new Date()
      }
    })

    return NextResponse.json({
      ok: true,
      calorieLog
    })
  } catch (error) {
    console.error('Log calorie API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
