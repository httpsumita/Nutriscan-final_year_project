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

<<<<<<< HEAD
=======
    // Validate file type and size
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file type. Please upload PDF, JPG, or PNG files.' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    const maxSize = 10 * 1024 * 1024
=======
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
    if (file.size > maxSize) {
      return NextResponse.json(
        { ok: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Determine mime type for Gemini — PDFs sent as jpeg for vision model
    const mimeTypeForAnalysis = file.type === 'application/pdf' ? 'image/jpeg' : file.type

    // Run AI analysis on the document
    const analysisResult = await analyzeHealthDocument(base64, mimeTypeForAnalysis)
=======
    // Convert file to buffer for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c

    // Store in database (encrypted)
    const report = await prisma.medicalReport.create({
      data: {
        userId: session.user.id,
<<<<<<< HEAD
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

=======
        fileName: file.name,
        data: buffer,
        fileSize: file.size,
        mimeType: file.type,
        encrypted: true,
        uploadedAt: new Date()
      }
    })

    // Return report info without sensitive data
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
    return NextResponse.json({
      ok: true,
      report: {
        id: report.id,
<<<<<<< HEAD
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        analysisResult,
      },
=======
        fileName: report.fileName,
        fileSize: report.fileSize,
        uploadedAt: report.uploadedAt.toISOString()
      }
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
    })

  } catch (error) {
<<<<<<< HEAD
    console.error('Medical report upload error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
=======
    console.error('Upload medical report API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
  }
}