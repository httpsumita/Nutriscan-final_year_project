import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (PDF or Image)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Only PDF and image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
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
    const fileUrl = `data:${file.type};base64,${base64}`

    // Store in database
    const report = await prisma.medicalReport.create({
      data: {
        userId: session.user.id,
        fileUrl,
        parsedData: {
          fileName: file.name,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        },
        encrypted: false
      }
    })

    return NextResponse.json({
      ok: true,
      report: {
        id: report.id,
        fileName: file.name,
        uploadedAt: report.id // Using report ID as timestamp
      }
    })
  } catch (error) {
    console.error('Medical report upload error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
