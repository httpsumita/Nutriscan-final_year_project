import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const log = await prisma.waterIntake.findUnique({
      where: { id: params.id }
    })

    if (!log || log.userId !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.waterIntake.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete water log error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
