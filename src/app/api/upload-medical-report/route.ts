import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const KNOWN_CONDITIONS = [
  'PCOS',
  'Thyroid',
  'Insulin resistance',
  'Menopause',
  'Type 2 diabetes',
]

async function analyzeHealthDocument(
  base64Data: string,
  mimeType: string
): Promise<{
  detectedConditions: string[]
  keyFindings: string
  recommendations: string[]
  rawSummary: string
}> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { detectedConditions: [], keyFindings: '', recommendations: [], rawSummary: '' }
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are a medical document analyst. Analyse this health document or blood report.

Extract the following and return ONLY valid JSON:
{
  "detectedConditions": [], // array of conditions from this list only: ${KNOWN_CONDITIONS.join(', ')}
  "keyFindings": "1-2 sentence plain-English summary of the most important findings",
  "recommendations": [], // array of up to 3 short dietary/lifestyle recommendations based on findings
  "rawSummary": "brief summary of what type of document this is and its overall content"
}

Rules:
- Only include conditions from the provided list that are clearly supported by the document
- If nothing relevant found, return empty arrays
- Keep language simple, non-clinical`

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType.startsWith('image') ? mimeType : 'image/jpeg',
          data: base64Data,
        },
      },
      prompt,
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        detectedConditions: (parsed.detectedConditions || []).filter((c: string) =>
          KNOWN_CONDITIONS.includes(c)
        ),
        keyFindings: parsed.keyFindings || '',
        recommendations: parsed.recommendations || [],
        rawSummary: parsed.rawSummary || '',
      }
    }
  } catch (err) {
    console.warn('Gemini analysis failed:', err)
  }

  return { detectedConditions: [], keyFindings: '', recommendations: [], rawSummary: '' }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Only PDF and image files are allowed' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { ok: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Determine mime type for Gemini — PDFs sent as jpeg for vision model
    const mimeTypeForAnalysis = file.type === 'application/pdf' ? 'image/jpeg' : file.type

    // Run AI analysis on the document
    const analysisResult = await analyzeHealthDocument(base64, mimeTypeForAnalysis)

    // Store in database
    const report = await prisma.medicalReport.create({
      data: {
        userId: session.user.id,
        fileUrl: `data:${file.type};base64,${base64}`,
        parsedData: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          analysisResult,
        },
        encrypted: false,
      },
    })

    // If conditions were detected, update the user's profile automatically
    if (analysisResult.detectedConditions.length > 0) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (user) {
        const merged = Array.from(
          new Set([...(user.conditions || []), ...analysisResult.detectedConditions])
        )
        await prisma.user.update({
          where: { id: session.user.id },
          data: { conditions: merged },
        })
      }
    }

    return NextResponse.json({
      ok: true,
      report: {
        id: report.id,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        analysisResult,
      },
    })
  } catch (error) {
    console.error('Medical report upload error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
