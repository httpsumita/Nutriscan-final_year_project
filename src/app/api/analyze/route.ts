import { NextResponse } from 'next/server'
import { generatePersonalizedAnalysis } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'

// This endpoint orchestrates RAG + model reasoning for personalized analysis
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productName, ingredients = [], userId, scanId } = body

    if (!productName || !userId) {
      return NextResponse.json(
        { ok: false, error: 'productName and userId required' },
        { status: 400 }
      )
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // TODO: Query relevant research docs from ResearchDoc table
    // For now, pass empty context
    const researchContext = ""

    // Generate AI-powered analysis
    const analysis = await generatePersonalizedAnalysis(
      productName,
      ingredients,
      {
        conditions: user.conditions,
        goals: user.goals
      },
      researchContext
    )

    // Update scan with analysis if scanId provided
    if (scanId) {
      await prisma.scan.update({
        where: { id: scanId },
        data: { score: analysis.score || 50 }
      })
    }

    return NextResponse.json({
      ok: true,
      result: {
        score: analysis.score || 50,
        explanation: analysis.explanation || "Analysis complete",
        recommendations: analysis.recommendations || [],
        citations: analysis.citations || []
      }
    })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
