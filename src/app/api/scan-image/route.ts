import { NextResponse } from 'next/server'
import { analyzeProductImage } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import { computeScore } from '@/lib/scoring'
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
    const { imageData } = body

    if (!imageData) {
      return NextResponse.json(
        { ok: false, error: 'imageData required' },
        { status: 400 }
      )
    }

    // Analyze image with Gemini
    const extraction = await analyzeProductImage(imageData)

    // Fetch user profile for scoring
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Compute score
    const score = computeScore(
      100,
      extraction.ingredients || [],
      { conditions: user.conditions, goals: user.goals },
      0,
      extraction.nutrition || {}
    )

    // Store scan
    const scan = await prisma.scan.create({
      data: {
        userId: session.user.id,
        productName: extraction.productName || 'Unknown',
        ingredients: extraction.ingredients || [],
        nutrition: extraction.nutrition || {},
        score: score
      }
    })

    return NextResponse.json({
      ok: true,
      product: {
        productName: extraction.productName,
        ingredients: extraction.ingredients,
        nutrition: extraction.nutrition,
        allergens: extraction.allergens,
        score: score,
        scanId: scan.id
      }
    })
  } catch (error) {
    console.error('Scan image API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
