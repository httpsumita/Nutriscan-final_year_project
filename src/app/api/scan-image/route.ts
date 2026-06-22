import { NextResponse } from 'next/server'
import { extractProductTextFromImage } from '@/lib/vision'
import { prisma } from '@/lib/prisma'
import { computeScore } from '@/lib/scoring'
import { scoreProductForUserHealth, calculateDailyHormonalLoad } from '@/lib/scoring-enhanced'
import { buildRagContext } from '@/lib/rag-search'
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

    // Extract text from image using Google Vision OCR (free tier - 1000 requests/month)
    const extraction = await extractProductTextFromImage(imageData)

    // Fetch user profile for scoring - with database fallback
    let userConditions: string[] = []
    let userGoals: string[] = []
    let scanId: string | null = null
    let hormonalLoad = 50 // default

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (user) {
        userConditions = user.conditions || []
        userGoals = user.goals || []
      }
    } catch (dbError) {
      // Database not available - use defaults
      console.warn('Database unavailable, using default user profile:', dbError)
    }

    // Build RAG context (search Food.json and web for ingredient info)
    const ragContext = await buildRagContext(extraction.ingredients || [], userConditions, userGoals)

    // Score product using enhanced scoring with RAG context (1-10 scale)
    const productScore = scoreProductForUserHealth(
      extraction.productName || 'Unknown',
      extraction.ingredients || [],
      { conditions: userConditions, goals: userGoals },
      ragContext
    )

    // Convert 1-10 score to 0-100 for backward compatibility
    const score100 = Math.round((productScore.overallScore / 10) * 100)

    // Try to store scan and daily log in database
    try {
      // Store scan
      const scan = await prisma.scan.create({
        data: {
          userId: session.user.id,
          productName: extraction.productName || 'Unknown',
          ingredients: extraction.ingredients || [],
          nutrition: extraction.nutrition || {},
          score: score100
        }
      })
      scanId = scan.id

      // Get today's date for daily log
      const today = new Date()
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      // Find or create daily log
      let dailyLog = await prisma.dailyLog.findFirst({
        where: { userId: session.user.id, date: dayStart }
      })

      if (!dailyLog) {
        dailyLog = await prisma.dailyLog.create({
          data: {
            userId: session.user.id,
            date: dayStart,
            consumedItems: [],
            hormonalLoadScore: 50
          }
        })
      }

      // Add product to daily intake (format: "productName|score")
      const consumedItems = [...(dailyLog.consumedItems || []), `${extraction.productName}|${productScore.overallScore}`]

      // Calculate daily hormonal load
      hormonalLoad = calculateDailyHormonalLoad(consumedItems, {
        conditions: userConditions,
        goals: userGoals
      })

      // Update daily log with new intake
      await prisma.dailyLog.update({
        where: { id: dailyLog.id },
        data: {
          consumedItems,
          hormonalLoadScore: hormonalLoad
        }
      })
    } catch (dbError) {
      // Database storage failed - still return analysis results
      console.warn('Database storage failed, returning analysis only:', dbError)
    }

    return NextResponse.json({
      ok: true,
      product: {
        productName: extraction.productName,
        ingredients: extraction.ingredients,
        nutrition: extraction.nutrition,
        allergens: extraction.allergens,
        score: productScore.overallScore,
        scoreRange: '1-10',
        healthRecommendation: productScore.healthRecommendation,
        shouldConsume: productScore.shouldConsume,
        riskFactors: productScore.riskFactors,
        benefitFactors: productScore.benefitFactors,
        dailyHormonalLoad: hormonalLoad,
        scanId: scanId,
        databaseAvailable: scanId !== null,
        ragContext: {
          foodDbMatches: ragContext.foodDbMatches.map(f => ({ name: f.name, group: f.food_group })),
          analysisOptions: ragContext.analysisOptions,
          comparison: ragContext.combinedNutritionInfo.comparison,
          finalRecommendation: ragContext.combinedNutritionInfo.finalRecommendation,
          bestOption: ragContext.combinedNutritionInfo.bestOption,
          combinedScore: ragContext.combinedNutritionInfo.combinedScore
        }
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
