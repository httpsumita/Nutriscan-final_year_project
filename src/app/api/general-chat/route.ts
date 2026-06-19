import { NextResponse } from 'next/server'
import { auth } from '@/auth'
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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { message, conditions, goals, chatHistory } = body

    if (!message) {
      return NextResponse.json(
        { ok: false, error: 'Message required' },
        { status: 400 }
      )
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build context from chat history
    const historyContext = chatHistory && chatHistory.length > 0 
      ? `\n\nRecent conversation context:\n${chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}`
      : ''

    const prompt = `You are a knowledgeable and supportive nutrition and health advisor. Provide helpful, evidence-based guidance while being warm and encouraging.

User Profile:
- Health Conditions: ${conditions?.join(', ') || 'None specified'}
- Health Goals: ${goals?.join(', ') || 'General wellness'}

Guidelines:
1. Be conversational, supportive, and encouraging
2. Provide evidence-based nutrition and health advice
3. Consider their specific health conditions when giving recommendations
4. Keep responses concise (2-4 sentences unless they ask for detailed explanations)
5. Ask follow-up questions when appropriate
6. If asked about medical diagnosis or treatment, remind them to consult healthcare professionals
7. Focus on nutrition, lifestyle, and wellness topics

${historyContext}

User's Question: ${message}

Provide a helpful, personalized response:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      ok: true,
      response: text
    })
  } catch (error) {
    console.error('General chat API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}