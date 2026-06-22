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

    // Fetch user's scans and daily logs
    const scans = await prisma.scan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const dailyLogs = await prisma.dailyLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 30
    })

    // Fetch calorie and water logs
    const calorieLogsData = await prisma.calorieLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 100
    })

    const waterLogsData = await prisma.waterIntake.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 100
    })

    // Only return data if user has activity
    if (scans.length === 0 && dailyLogs.length === 0 && calorieLogsData.length === 0 && waterLogsData.length === 0) {
      return NextResponse.json({
        ok: true,
        insights: {
          hasData: false,
          week: [],
          topProducts: [],
          calorieData: [],
          waterData: []
        }
      })
    }

    // Build weekly insights from actual data
    const weeklyInsights = dailyLogs.slice(0, 7).map((log) => ({
      date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
      load: log.hormonalLoadScore,
      scans: log.consumedItems?.length || 0,
      topProduct: log.consumedItems?.[0]?.split('|')?.[0] || 'N/A'
    }))

    // Top products from scans
    const productMap = new Map<string, { scans: number; scores: number[] }>()
    scans.forEach((scan) => {
      const key = scan.productName
      if (!productMap.has(key)) {
        productMap.set(key, { scans: 0, scores: [] })
      }
      const existing = productMap.get(key)!
      existing.scans++
      existing.scores.push(scan.score)
    })

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        scans: data.scans,
        avgScore: ((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) / 10).toFixed(1)
      }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 5)

    // Calorie trends by day
    const caloriesByDay = new Map<string, number>()
    calorieLogsData.forEach((log) => {
      const dayKey = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })
      caloriesByDay.set(dayKey, (caloriesByDay.get(dayKey) || 0) + log.calories)
    })

    const calorieData = Array.from(caloriesByDay.entries())
      .slice(0, 7)
      .map(([day, calories]) => ({ day, calories }))

    // Water trends by day
    const waterByDay = new Map<string, number>()
    waterLogsData.forEach((log) => {
      const dayKey = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })
      waterByDay.set(dayKey, (waterByDay.get(dayKey) || 0) + log.amount)
    })

    const waterData = Array.from(waterByDay.entries())
      .slice(0, 7)
      .map(([day, water]) => ({ day, water }))

    // Calculate totals
    const totalCalories = calorieLogsData.reduce((sum, log) => sum + log.calories, 0)
    const totalWater = waterLogsData.reduce((sum, log) => sum + log.amount, 0)
    const avgCaloriesPerDay = calorieLogsData.length > 0 ? Math.round(totalCalories / caloriesByDay.size) : 0
    const avgWaterPerDay = waterLogsData.length > 0 ? Math.round(totalWater / waterByDay.size) : 0

    return NextResponse.json({
      ok: true,
      insights: {
        hasData: true,
        week: weeklyInsights,
        topProducts,
        calorieData,
        waterData,
        totals: {
          totalScans: scans.length,
          avgLoad: Math.round(dailyLogs.reduce((sum, log) => sum + log.hormonalLoadScore, 0) / Math.max(dailyLogs.length, 1)),
          totalCalories,
          avgCaloriesPerDay,
          totalWater,
          avgWaterPerDay
        }
      }
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
