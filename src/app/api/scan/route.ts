import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeScore } from '@/lib/scoring'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  // Expected body: { userId, productName, ingredients, nutrition }
  const { userId, productName, ingredients = [], nutrition = {} } = body

  // Fetch user daily load placeholder
  const dailyLoad = 0

  const score = computeScore(100, ingredients, { conditions: [], goals: [] }, dailyLoad)

  // Persist minimal scan record
  try {
    const scan = await prisma.scan.create({
      data: {
        userId: userId || 'anonymous',
        productName: productName || 'unknown',
        ingredients: ingredients,
        nutrition: nutrition,
        score: score
      }
    })

    return NextResponse.json({ ok: true, scan })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
