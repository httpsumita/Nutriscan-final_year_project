import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { userId, productName, date } = body

  if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 })

  // Find or create daily log for date
  const d = date ? new Date(date) : new Date()

  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  let log = await prisma.dailyLog.findFirst({ where: { userId, date: dayStart } })
  if (!log) {
    log = await prisma.dailyLog.create({
      data: { userId, date: dayStart, consumedItems: [productName || 'unknown'], hormonalLoadScore: 0 }
    })
  } else {
    log = await prisma.dailyLog.update({
      where: { id: log.id },
      data: { consumedItems: { push: productName || 'unknown' } }
    })
  }

  return NextResponse.json({ ok: true, log })
}
