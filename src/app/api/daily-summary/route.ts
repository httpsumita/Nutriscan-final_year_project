import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 })

  const today = new Date()
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const log = await prisma.dailyLog.findFirst({ where: { userId, date: dayStart } })
  return NextResponse.json({ ok: true, log })
}
