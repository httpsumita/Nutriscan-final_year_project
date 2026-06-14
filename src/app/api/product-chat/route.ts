import { NextResponse } from 'next/server'
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
    const body = await req.json()
    const { productName, ingredients, score, question, conditions, goals } = body

    if (!productName || !question) {
      return NextResponse.json(
        { ok: false, error: 'productName and question required' },
        { status: 400 }
      )
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a nutritional health advisor. The user just scanned a food product and wants to know more about it.

Product Information:
- Name: ${productName}
- Ingredients: ${ingredients?.join(', ') || 'Unknown'}
- Compatibility Score: ${score}/10 (where 10 is excellent for their health profile)
- User's Health Conditions: ${conditions?.join(', ') || 'Not specified'}
- Health Goals: ${goals?.join(', ') || 'Not specified'}

User's Question: ${question}

Provide a helpful, concise response (2-3 sentences max) in a conversational tone. Focus on how this relates to their specific health conditions and goals.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      ok: true,
      response: text
    })
  } catch (error) {
    console.error('Product chat API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
