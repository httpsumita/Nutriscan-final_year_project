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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        sex: true,
        conditions: true,
        goals: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, user })
  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
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
        name: name || undefined,
        age: age ? parseInt(age) : undefined,
        sex: sex || undefined,
        conditions: conditions || undefined,
        goals: goals || undefined
      },
      select: {
        id: true,
        name: true,
        age: true,
        sex: true,
        conditions: true,
        goals: true
      }
    })

    return NextResponse.json({ ok: true, user })
  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
