import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all medical reports for user
    const reports = await prisma.medicalReport.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        parsedData: true,
        createdAt: true,
        encrypted: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      reports: reports.map(r => ({
        id: r.id,
        fileName: (r.parsedData as any)?.fileName || 'Medical Report',
        uploadedAt: r.createdAt,
        encrypted: r.encrypted
      }))
    })
  } catch (error) {
    console.error('Get medical reports error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
