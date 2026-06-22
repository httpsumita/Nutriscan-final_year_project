'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Camera, Settings, TrendingUp, LogOut, Apple, Leaf, Zap, ArrowRight, Utensils, Droplets, User, BarChart3, ChevronDown } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [stats, setStats] = useState({
    dailyLoad: 0,
    scansToday: 0,
    userName: '',
    totalCalories: 0,
    totalWater: 0,
    calorieGoal: 2000,
    waterGoal: 2000
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      if (session?.user?.id) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [dailyResponse, totalsResponse] = await Promise.all([
          fetch(`/api/daily-summary?userId=${session.user.id}`),
          fetch(`/api/daily-totals?date=${today.toISOString()}`)
        ])

        const dailyData = await dailyResponse.json()
        const totalsData = await totalsResponse.json()

        setStats({
          dailyLoad: dailyData.log?.hormonalLoadScore || 0,
          scansToday: dailyData.log?.consumedItems?.length || 0,
          userName: session?.user?.name || 'User',
          totalCalories: totalsData.totals?.calories || 0,
          totalWater: totalsData.totals?.water || 0,
          calorieGoal: totalsData.totals?.calorieGoal || 2000,
          waterGoal: totalsData.totals?.waterGoal || 2000
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session])

  // Listen for calorie and water updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchStats()
    }

    window.addEventListener('calorieAdded', handleUpdate)
    window.addEventListener('waterAdded', handleUpdate)

    return () => {
      window.removeEventListener('calorieAdded', handleUpdate)
      window.removeEventListener('waterAdded', handleUpdate)
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-0">
        <div className="text-center">
          <div className="inline-block w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-sage-700 rounded-full animate-spin" />
          </div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-0 to-sage-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-700">Welcome, {stats.userName}!</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Your personalized nutrition dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="p-2 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition"
              title="Manage Profile"
            >
              <Settings className="w-5 h-5" strokeWidth={2} />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition"
              >
                <div className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-sage-600" strokeWidth={2} />
                </div>
                <ChevronDown className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                  {/* User Info */}
                  <div className="p-4 border-b border-neutral-200">
                    <p className="font-semibold text-neutral-700">{stats.userName}</p>
                    <p className="text-xs text-neutral-500 mt-1">{session?.user?.email}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="p-4 border-b border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Hormonal Load:</span>
                      <span className="font-semibold text-neutral-700">{stats.dailyLoad}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Calories:</span>
                      <span className="font-semibold text-neutral-700">{stats.totalCalories}/{stats.calorieGoal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Water:</span>
                      <span className="font-semibold text-neutral-700">{Math.round(stats.totalWater / 250)} cups</span>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="p-2 border-b border-neutral-200 space-y-1">
                    <Link
                      href="/insights"
                      className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50 rounded transition text-sm"
                    >
                      <BarChart3 className="w-4 h-4" strokeWidth={2} />
                      View Insights
                    </Link>
                    <Link
                      href="/onboarding"
                      className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50 rounded transition text-sm"
                    >
                      <Settings className="w-4 h-4" strokeWidth={2} />
                      Edit Profile
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="p-2">
                    <button
                      onClick={() => signOut({ redirect: true, redirectTo: '/' })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* Quick Actions - Primary CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Scan Product - Large Hero Card */}
          <Link
            href="/scan"
            className="group bg-gradient-to-br from-sage-600 to-sage-700 rounded-2xl p-8 text-white overflow-hidden relative shadow-lg hover:shadow-xl transition-all hover:scale-105 md:col-span-1"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
                  <Camera className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
              <h2 className="text-3xl font-semibold mb-2">Scan a Product</h2>
              <p className="text-sage-100 mb-6 text-sm leading-relaxed">
                Point your camera at any food product to get an instant compatibility score.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                Start scanning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>

          {/* Track Food - Hero Card */}
          <Link
            href="/track-food"
            className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white overflow-hidden relative shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
                  <Utensils className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Track Food</h2>
              <p className="text-orange-100 mb-6 text-sm leading-relaxed">
                Log your meals and calories manually.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                Track food <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>

          {/* Track Water - Hero Card */}
          <Link
            href="/track-water"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white overflow-hidden relative shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
                  <Droplets className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Track Water</h2>
              <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                Log your daily water intake.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                Track water <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Daily Hormonal Load */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Daily Hormonal Load</p>
              <div className="bg-rose-100 p-2 rounded-lg">
                <Apple className="w-4 h-4 text-rose-600" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-neutral-700">{stats.dailyLoad}</span>
              <span className="text-sm text-neutral-500">/100</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  stats.dailyLoad <= 30 ? 'bg-green-500' :
                  stats.dailyLoad <= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.dailyLoad, 100)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {stats.dailyLoad === 0 && '✓ Fresh start today'}
              {stats.dailyLoad > 0 && stats.dailyLoad <= 30 && '✓ Great choices!'}
              {stats.dailyLoad > 30 && stats.dailyLoad <= 60 && '◐ Could be better'}
              {stats.dailyLoad > 60 && '⚠ Consider adjusting'}
            </p>
          </div>

          {/* Total Calories */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Total Calories</p>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Utensils className="w-4 h-4 text-orange-600" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-neutral-700">{stats.totalCalories}</span>
              <span className="text-sm text-neutral-500">/ {stats.calorieGoal}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min((stats.totalCalories / stats.calorieGoal) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {stats.totalCalories === 0 && 'No meals logged'}
              {stats.totalCalories > 0 && stats.totalCalories < stats.calorieGoal && '✓ Under goal'}
              {stats.totalCalories >= stats.calorieGoal && '✓ Goal reached!'}
            </p>
          </div>

          {/* Total Water */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Water Intake</p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Droplets className="w-4 h-4 text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-neutral-700">{Math.round(stats.totalWater / 250)}</span>
              <span className="text-sm text-neutral-500">cups</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min((stats.totalWater / stats.waterGoal) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {stats.totalWater === 0 && 'No water logged'}
              {stats.totalWater > 0 && stats.totalWater < stats.waterGoal && '✓ Keep going'}
              {stats.totalWater >= stats.waterGoal && '✓ Goal reached!'}
            </p>
          </div>

          {/* Items Scanned Today */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">Items Scanned Today</p>
              <div className="bg-sage-100 p-2 rounded-lg">
                <Leaf className="w-4 h-4 text-sage-600" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-neutral-700">{stats.scansToday}</span>
              <span className="text-sm text-neutral-500">scans</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < Math.min(stats.scansToday, 5) ? 'bg-sage-400' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {stats.scansToday === 0 && 'Scan your first product'}
              {stats.scansToday > 0 && 'Keep tracking your meals'}
            </p>
          </div>
        </div>

        {/* Onboarding Section - If no health data */}
        {stats.dailyLoad === 0 && stats.scansToday === 0 && (
          <div className="bg-gradient-to-r from-sage-50 to-sage-100 rounded-2xl border border-sage-200 p-8 mb-12">
            <div className="flex items-start gap-4">
              <div className="bg-sage-200 p-3 rounded-lg mt-1">
                <Zap className="w-5 h-5 text-sage-700" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Get Started with Your First Scan</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Start by scanning a food product. Our AI will analyze the ingredients and give you a personalized compatibility score based on your health profile.
                </p>
                <Link 
                  href="/scan"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700 transition"
                >
                  <Camera className="w-4 h-4" />
                  Take Your First Scan
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How It Works - Minimal */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-700 mb-6">How NutriScan Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Scan', desc: 'Point camera at food product' },
              { num: '2', title: 'Extract', desc: 'AI reads ingredients & nutrition' },
              { num: '3', title: 'Analyze', desc: 'Score based on your profile' },
              { num: '4', title: 'Track', desc: 'Log consumption & see trends' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-block w-12 h-12 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center font-bold mb-3">
                  {step.num}
                </div>
                <h4 className="font-medium text-neutral-700 mb-1">{step.title}</h4>
                <p className="text-xs text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
