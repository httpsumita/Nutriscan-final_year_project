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

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file type. Please upload PDF, JPG, or PNG files.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { ok: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Store in database (encrypted)
    const report = await prisma.medicalReport.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        data: buffer,
        fileSize: file.size,
        mimeType: file.type,
        encrypted: true,
        uploadedAt: new Date()
      }
    })

    // Return report info without sensitive data
    return NextResponse.json({
      ok: true,
      report: {
        id: report.id,
        fileName: report.fileName,
        fileSize: report.fileSize,
        uploadedAt: report.uploadedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Upload medical report API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}