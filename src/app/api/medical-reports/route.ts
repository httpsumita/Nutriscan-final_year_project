import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reports = await prisma.medicalReport.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true
      },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      reports: reports.map(report => ({
        id: report.id,
        fileName: report.fileName,
        fileSize: report.fileSize,
        uploadedAt: report.uploadedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Get medical reports API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { ok: false, error: 'Report ID required' },
        { status: 400 }
      )
    }

    await prisma.medicalReport.deleteMany({
      where: {
        id: reportId,
        userId: session.user.id // Ensure user can only delete their own reports
      }
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Delete medical report API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}