'use client'

import Link from 'next/link'
<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, TrendingUp, Calendar, Target, Award, Zap, AlertCircle, CheckCircle, BarChart3, PieChart, Activity } from 'lucide-react'

interface InsightData {
  weeklyScore: number[]
  monthlyTrends: {
    averageScore: number
    totalScans: number
    improvement: number
  }
  topCategories: {
    name: string
    score: number
    count: number
  }[]
  recommendations: {
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  }[]
}

export default function InsightsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightData>({
    weeklyScore: [7.2, 6.8, 7.5, 8.1, 7.9, 8.3, 7.8],
    monthlyTrends: {
      averageScore: 7.5,
      totalScans: 47,
      improvement: 12
    },
    topCategories: [
      { name: 'Fruits & Vegetables', score: 8.7, count: 15 },
      { name: 'Whole Grains', score: 7.9, count: 8 },
      { name: 'Lean Proteins', score: 8.2, count: 12 },
      { name: 'Processed Foods', score: 4.1, count: 6 },
      { name: 'Dairy Products', score: 6.8, count: 6 }
    ],
    recommendations: [
      {
        type: 'success',
        title: 'Excellent Progress!',
        message: 'Your food choices have improved by 12% this month. Keep focusing on whole foods.'
      },
      {
        type: 'warning',
        title: 'Reduce Processed Foods',
        message: 'Consider limiting processed snacks. They average only 4.1/10 for your health profile.'
      },
      {
        type: 'info',
        title: 'Hydration Reminder',
        message: 'Maintain your water intake goals. You\'re consistently hitting 6-7 glasses daily.'
      }
    ]
  })

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (session?.user?.id) {
          const response = await fetch('/api/insights')
          const data = await response.json()
          if (data.ok) {
            // For now, use mock data. In production, this would be real insights
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Failed to fetch insights:', error)
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
      } finally {
        setLoading(false)
      }
    }

<<<<<<< HEAD
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
=======
    if (session?.user?.id) {
      fetchInsights()
    } else {
      setLoading(false)
    }
  }, [session])

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxScore = Math.max(...insights.weeklyScore)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your insights...</p>
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
        </div>
      </div>
    )
  }

<<<<<<< HEAD
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
=======
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-50">
      <div className="max-w-6xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-neutral-700 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              Health Insights
            </h1>
            <p className="text-neutral-600 mt-1">Discover patterns and improve your nutrition journey</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Monthly Average */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-neutral-700">{insights.monthlyTrends.averageScore}</div>
                <div className="text-sm text-neutral-500">Monthly Average</div>
              </div>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                style={{ width: `${(insights.monthlyTrends.averageScore / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-3 font-medium">
              📈 {insights.monthlyTrends.improvement > 0 ? '+' : ''}{insights.monthlyTrends.improvement}% from last month
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
            </p>
          </div>

          {/* Total Scans */}
<<<<<<< HEAD
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
=======
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-neutral-700">{insights.monthlyTrends.totalScans}</div>
                <div className="text-sm text-neutral-500">Products Scanned</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600">This Month</span>
              <span className="text-xs font-medium text-blue-600">🎯 Great activity!</span>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Health Hero</div>
                <div className="text-sm opacity-90">Achievement Level</div>
              </div>
            </div>
            <p className="text-sm opacity-90">🏆 Consistent healthy choices for 2+ weeks!</p>
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
          </div>
        </div>

        {/* Weekly Trends Chart */}
<<<<<<< HEAD
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
=======
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" strokeWidth={2} />
            <h2 className="text-xl font-semibold text-neutral-700">Weekly Score Trends</h2>
          </div>
          
          {/* Chart */}
          <div className="relative">
            <div className="flex items-end justify-between h-48 gap-2">
              {insights.weeklyScore.map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-neutral-100 rounded-t-lg relative overflow-hidden" style={{ height: '180px' }}>
                    <div 
                      className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-1000 ${
                        score >= 8 ? 'bg-gradient-to-t from-green-400 to-emerald-500' :
                        score >= 6 ? 'bg-gradient-to-t from-blue-400 to-blue-500' :
                        score >= 4 ? 'bg-gradient-to-t from-yellow-400 to-orange-400' :
                        'bg-gradient-to-t from-orange-500 to-red-500'
                      }`}
                      style={{ 
                        height: `${(score / maxScore) * 100}%`,
                        animationDelay: `${index * 150}ms`
                      }}
                    />
                    {/* Score Label */}
                    <div className="absolute top-2 left-0 right-0 text-center">
                      <span className="text-xs font-bold text-neutral-700 bg-white px-2 py-1 rounded shadow-sm">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-600">{weekDays[index]}</span>
                </div>
              ))}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-neutral-500 -ml-8">
              <span>10</span>
              <span>7.5</span>
              <span>5</span>
              <span>2.5</span>
              <span>0</span>
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* Categories & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-indigo-600" strokeWidth={2} />
              <h2 className="text-xl font-semibold text-neutral-700">Food Categories</h2>
            </div>
            
            <div className="space-y-4">
              {insights.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      category.score >= 8 ? 'bg-green-400' :
                      category.score >= 6 ? 'bg-blue-400' :
                      category.score >= 4 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h3 className="font-medium text-neutral-700">{category.name}</h3>
                      <p className="text-sm text-neutral-500">{category.count} products scanned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-neutral-700">{category.score}</div>
                    <div className="text-xs text-neutral-500">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-sage-600" strokeWidth={2} />
              <h2 className="text-xl font-semibold text-neutral-700">Personalized Tips</h2>
            </div>
            
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'success' ? 'bg-green-50 border-green-400' :
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                      rec.type === 'success' ? 'bg-green-100' :
                      rec.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {rec.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2} />}
                      {rec.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" strokeWidth={2} />}
                      {rec.type === 'info' && <Activity className="w-4 h-4 text-blue-600" strokeWidth={2} />}
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        rec.type === 'success' ? 'text-green-800' :
                        rec.type === 'warning' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {rec.title}
                      </h3>
                      <p className={`text-sm ${
                        rec.type === 'success' ? 'text-green-700' :
                        rec.type === 'warning' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/scan"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-sage-600 to-sage-700 text-white rounded-lg hover:from-sage-700 hover:to-sage-800 transition-all font-medium shadow-md hover:shadow-lg"
          >
            <Activity className="w-5 h-5" strokeWidth={2} />
            Scan More Products
          </Link>
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-all font-medium"
          >
            <Calendar className="w-5 h-5" strokeWidth={2} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
