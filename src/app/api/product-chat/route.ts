import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { productName, ingredients, score, scoreRange, question, scanId } = body

    if (!productName || !question) {
      return NextResponse.json(
        { ok: false, error: 'productName and question required' },
        { status: 400 }
      )
    }

    // Fetch user health profile from database
    let userConditions: string[] = []
    let userGoals: string[] = []
    let userName = 'there'

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (user) {
        userConditions = user.conditions || []
        userGoals = user.goals || []
        userName = user.name || 'there'
      }
    } catch (dbError) {
      console.warn('Database fetch failed, using fallback data:', dbError)
    }

    // Fetch scan data if scanId provided (to get nutrition info)
    let nutrition: Record<string, any> = {}
    let allergens: string[] = []

    if (scanId) {
      try {
        const scan = await prisma.scan.findUnique({
          where: { id: scanId }
        })

        if (scan) {
          nutrition = (scan.nutrition as Record<string, any>) || {}
          // Note: allergens not stored in Scan model, but can be extracted
        }
      } catch (scanError) {
        console.warn('Scan fetch failed:', scanError)
      }
    }

    // Format nutrition info for context
    const nutritionStr = Object.entries(nutrition)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'Not available'

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build a comprehensive context prompt with OCR data and user health profile
    const prompt = `You are a personalized nutritional health advisor. A user has scanned a food product using OCR and wants your expert advice.

PRODUCT OCR DATA:
- Name: ${productName}
- Extracted Ingredients: ${ingredients?.join(', ') || 'Unknown'}
- Nutrition Facts: ${nutritionStr}
- Allergens: ${allergens.length > 0 ? allergens.join(', ') : 'Not detected'}

PERSONALIZED HEALTH PROFILE:
- Name: ${userName}
- Health Conditions: ${userConditions.length > 0 ? userConditions.join(', ') : 'Not specified'}
- Health Goals: ${userGoals.length > 0 ? userGoals.join(', ') : 'Not specified'}
- Product Compatibility Score: ${score || 'N/A'}${scoreRange ? ` (${scoreRange})` : ''}

USER'S QUESTION:
${question}

INSTRUCTIONS:
1. Acknowledge their specific health conditions and goals
2. Explain how THIS product specifically impacts THEIR health profile based on the OCR data
3. Highlight any ingredients that may be concerning given their conditions
4. Suggest how they could consume this product safely (serving size, frequency, pairings)
5. Offer healthier alternatives if appropriate
6. Keep response to 3-4 sentences max, but be thorough and personalized

TONE: Warm, expert, non-judgmental. Focus on practical advice tailored to THEIR conditions, not generic nutrition advice.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      ok: true,
      response: text,
      context: {
        productName,
        userConditions,
        userGoals,
        scoreUsed: score,
        ocrDataProvided: !!ingredients,
        userAuthenticated: true
      }
    })
  } catch (error) {
    console.error('Product chat API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
