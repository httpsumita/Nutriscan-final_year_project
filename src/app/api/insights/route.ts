import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 })
  }

  // Get last 7 days
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // Fetch daily logs for last 7 days
  const dailyLogs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo }
    },
    orderBy: { date: 'asc' }
  })

  // Fetch scans for last 7 days
  const scans = await prisma.scan.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Build chart data for each of last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() - (6 - i))
    return d
  })

  const labels = days.map(d =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  )

  const hormonalLoadData = days.map(day => {
    const log = dailyLogs.find(l => {
      const logDate = new Date(l.date)
      return logDate.toDateString() === day.toDateString()
    })
    return log?.hormonalLoadScore ?? 0
  })

  const scansPerDay = days.map(day => {
    return scans.filter(s => {
      const scanDate = new Date(s.createdAt)
      return scanDate.toDateString() === day.toDateString()
    }).length
  })

  const avgScorePerDay = days.map(day => {
    const dayScans = scans.filter(s => {
      const scanDate = new Date(s.createdAt)
      return scanDate.toDateString() === day.toDateString()
    })
    if (dayScans.length === 0) return 0
    return Math.round(dayScans.reduce((sum, s) => sum + s.score, 0) / dayScans.length)
  })

  // Top scanned products this week
  const productCount: Record<string, number> = {}
  scans.forEach(s => {
    productCount[s.productName] = (productCount[s.productName] || 0) + 1
  })
  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Weekly tips based on data
  const avgLoad = hormonalLoadData.reduce((a, b) => a + b, 0) / 7
  const weekly = []
  if (avgLoad > 50) weekly.push({ title: 'Reduce added sugars', reason: 'Your hormonal load has been high this week.' })
  if (avgLoad <= 30) weekly.push({ title: 'Great week!', reason: 'Your hormonal load has been consistently low.' })
  if (scans.length === 0) weekly.push({ title: 'Start scanning!', reason: 'No scans this week — try scanning a food product.' })

  return NextResponse.json({
    ok: true,
    chartData: {
      labels,
      hormonalLoadData,
      scansPerDay,
      avgScorePerDay
    },
    topProducts,
    insights: { weekly, monthly: [] },
    summary: {
      totalScans: scans.length,
      avgHormonalLoad: Math.round(avgLoad),
      avgCompatibilityScore: Math.round(avgScorePerDay.reduce((a, b) => a + b, 0) / 7)
    }
  })
}
