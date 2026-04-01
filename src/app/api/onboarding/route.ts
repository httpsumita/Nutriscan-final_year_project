import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
    const { name, age, sex, conditions, goals } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || 'User',
        age: age || null,
        sex: sex || null,
        conditions: conditions || [],
        goals: goals || []
      }
    })

    return NextResponse.json({ ok: true, user })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
