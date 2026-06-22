'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, TrendingDown, TrendingUp, Camera } from 'lucide-react'

interface DailyData {
  date: string
  load: number
  scans: number
  topProduct: string
}

interface InsightData {
  hasData: boolean
  week: DailyData[]
  topProducts: { name: string; scans: number; avgScore: string }[]
  calorieData: { day: string; calories: number }[]
  waterData: { day: string; water: number }[]
  totals: {
    totalScans: number
    avgLoad: number
    totalCalories: number
    avgCaloriesPerDay: number
    totalWater: number
    avgWaterPerDay: number
  }
}

export default function InsightsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<InsightData>({ hasData: false, week: [], topProducts: [], calorieData: [], waterData: [], totals: { totalScans: 0, avgLoad: 0, totalCalories: 0, avgCaloriesPerDay: 0, totalWater: 0, avgWaterPerDay: 0 } })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/insights')
        const result = await response.json()
        if (result.ok) {
          setData({
            hasData: result.insights.hasData || result.insights.weekly?.length > 0,
            week: result.insights.weekly || [],
            topProducts: result.insights.topProducts || []
          })
        }
      } catch (err) {
        console.error('Failed to fetch insights:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-neutral-0">
        <div className="text-center">
          <div className="inline-block w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-sage-700 rounded-full animate-spin" />
          </div>
          <p className="text-neutral-600">Loading insights...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data.hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
        <div className="max-w-6xl mx-auto py-8 px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-700">Your Insights</h1>
              <p className="text-neutral-500 text-sm mt-1">Weekly and monthly trends based on your scans</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sage-600 hover:text-sage-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md text-center bg-white rounded-2xl border border-neutral-200 p-12 shadow-sm">
              <div className="text-6xl mb-6">📊</div>
              <h2 className="text-2xl font-semibold text-neutral-700 mb-3">No Insights Yet</h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Start scanning food products to see your health trends, top foods, and hormonal load patterns over time.
              </p>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sage-700 text-white rounded-lg font-medium hover:bg-sage-800 transition"
              >
                <Camera className="w-4 h-4" />
                Start Scanning
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show data when available
  const avgWeeklyLoad = data.week.length > 0 ? Math.round(data.week.reduce((sum, d) => sum + d.load, 0) / data.week.length) : 0
  const totalScansWeek = data.week.reduce((sum, d) => sum + d.scans, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-700">Your Insights</h1>
            <p className="text-neutral-500 text-sm mt-1">Weekly and monthly trends based on your scans</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sage-600 hover:text-sage-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Avg Weekly Load */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Avg Weekly Load</p>
              <div className="bg-rose-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-rose-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-4xl font-bold text-neutral-700 mb-2">{avgWeeklyLoad}</p>
            <p className="text-xs text-neutral-500">
              {avgWeeklyLoad <= 35 ? '✓ Great choices this week' : avgWeeklyLoad <= 45 ? '◐ Room for improvement' : '⚠ Consider adjusting'}
            </p>
          </div>

          {/* Total Scans */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Scans This Week</p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Camera className="w-5 h-5 text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-4xl font-bold text-neutral-700 mb-2">{totalScansWeek}</p>
            <p className="text-xs text-neutral-500">Products tracked</p>
          </div>

          {/* Best Day */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Best Day</p>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-green-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-700 mb-2">
              {data.week.length > 0 ? Math.min(...data.week.map(d => d.load)) : 0}/100
            </p>
            <p className="text-xs text-neutral-500">
              {data.week.length > 0 ? data.week.find(d => d.load === Math.min(...data.week.map(d => d.load)))?.date : '-'}
            </p>
          </div>
        </div>

        {/* Weekly Trends Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-neutral-700 mb-6">Weekly Hormonal Load</h2>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-around gap-2 h-48 mb-4">
            {data.week.map((day) => {
              const height = (day.load / 60) * 100
              return (
                <div key={day.date} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 bg-gradient-to-t from-sage-600 to-sage-400 rounded-t-lg hover:from-sage-700 hover:to-sage-500 transition"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                    title={`${day.date}: ${day.load}/100`}
                  />
                  <span className="text-xs font-medium text-neutral-600">{day.date}</span>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
            <div>
              <p className="font-medium mb-1">Highest:</p>
              <p className="text-lg font-bold text-rose-600">
                {data.week.length > 0 ? Math.max(...data.week.map(d => d.load)) : 0}/100
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Lowest:</p>
              <p className="text-lg font-bold text-green-600">
                {data.week.length > 0 ? Math.min(...data.week.map(d => d.load)) : 0}/100
              </p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-neutral-700 mb-6">Your Top Scanned Foods</h2>
          
          <div className="space-y-4">
            {data.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                <div className="flex-1">
                  <p className="font-medium text-neutral-700">{product.name}</p>
                  <p className="text-xs text-neutral-500">{product.scans} scans</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sage-600">{product.avgScore}/10</p>
                  <p className="text-xs text-neutral-500">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie Trends */}
        {data.calorieData.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-neutral-700 mb-6">Weekly Calorie Intake</h2>
            
            <div className="flex items-end justify-around gap-2 h-48 mb-4">
              {data.calorieData.map((day) => {
                const height = (day.calories / 2500) * 100
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg hover:from-orange-700 hover:to-orange-500 transition"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                      title={`${day.day}: ${day.calories} cal`}
                    />
                    <span className="text-xs font-medium text-neutral-600">{day.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
              <div>
                <p className="font-medium mb-1">Avg Daily:</p>
                <p className="text-lg font-bold text-orange-600">{data.totals.avgCaloriesPerDay} cal</p>
              </div>
              <div>
                <p className="font-medium mb-1">Total:</p>
                <p className="text-lg font-bold text-orange-600">{data.totals.totalCalories} cal</p>
              </div>
            </div>
          </div>
        )}

        {/* Water Trends */}
        {data.waterData.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-neutral-700 mb-6">Weekly Water Intake</h2>
            
            <div className="flex items-end justify-around gap-2 h-48 mb-4">
              {data.waterData.map((day) => {
                const height = (day.water / 3000) * 100
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                      title={`${day.day}: ${day.water} ml`}
                    />
                    <span className="text-xs font-medium text-neutral-600">{day.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
              <div>
                <p className="font-medium mb-1">Avg Daily:</p>
                <p className="text-lg font-bold text-blue-600">{Math.round(data.totals.avgWaterPerDay / 250)} cups</p>
              </div>
              <div>
                <p className="font-medium mb-1">Total:</p>
                <p className="text-lg font-bold text-blue-600">{Math.round(data.totals.totalWater / 250)} cups</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
