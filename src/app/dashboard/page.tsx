'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Camera, Settings, Zap, BarChart3, LogOut, TrendingUp, Calendar, Droplets, Activity, Award, Target, FileText, MessageCircle, Utensils, Heart, Apple } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    dailyLoad: 35,
    waterIntake: 0,
    waterTotal: 0,
    waterGoal: 2000,
    calorieTotal: 0,
    calorieGoal: 2000,
    recentScans: [] as any[],
    weeklyAverage: 7.2,
    streak: 5,
    totalScans: 0,
    bestScore: 9.5,
    weeklyProgress: [6.2, 7.1, 6.8, 7.9, 8.2, 7.5, 7.2],
    calorieEntries: 0,
    waterEntries: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (session?.user?.id) {
          const today = new Date().toISOString()

          // Fetch daily totals (calories, water, scans)
          const totalsResponse = await fetch(`/api/daily-totals?date=${today}`)
          let totalsData = { ok: false, totals: {} }
          
          if (totalsResponse.ok) {
            try {
              totalsData = await totalsResponse.json()
            } catch (jsonError) {
              console.log('No daily totals available yet')
            }
          }

          // Fetch daily summary for hormonal load
          const summaryResponse = await fetch(`/api/daily-summary?userId=${session.user.id}`)
          let summaryData = { ok: false, log: {} }
          
          if (summaryResponse.ok) {
            try {
              summaryData = await summaryResponse.json()
            } catch (jsonError) {
              console.log('No daily summary available yet')
            }
          }

          setStats({
            // Hormonal load from summary or calculated from calories
            dailyLoad: summaryData.log?.hormonalLoadScore || 
                       (totalsData.totals?.calories ? Math.round((totalsData.totals.calories / 2000) * 100) : 35),
            
            // Water intake in glasses (250ml per glass)
            waterIntake: totalsData.totals?.water ? Math.floor(totalsData.totals.water / 250) : 0,
            waterTotal: totalsData.totals?.water || 0,
            waterGoal: totalsData.totals?.waterGoal || 2000,
            
            // Calorie data
            calorieTotal: totalsData.totals?.calories || 0,
            calorieGoal: totalsData.totals?.calorieGoal || 2000,
            
            // Scan data
            recentScans: [],
            totalScans: totalsData.totals?.scans || 0,
            
            // Entry counts
            calorieEntries: totalsData.totals?.calorieEntries || 0,
            waterEntries: totalsData.totals?.waterEntries || 0,
            
            // Keep default values for now (can be enhanced later)
            weeklyAverage: 7.2,
            streak: 5,
            bestScore: 9.5,
            weeklyProgress: [6.2, 7.1, 6.8, 7.9, 8.2, 7.5, 7.2]
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchStats()
    }

    // Listen for updates from tracking pages
    const handleUpdate = () => {
      if (session?.user?.id) {
        fetchStats()
      }
    }

    window.addEventListener('calorieAdded', handleUpdate)
    window.addEventListener('waterAdded', handleUpdate)

    return () => {
      window.removeEventListener('calorieAdded', handleUpdate)
      window.removeEventListener('waterAdded', handleUpdate)
    }
  }, [session])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-0 text-neutral-600">Loading...</div>
  }

  const cycleDay = 12
  const phaseLabel = cycleDay <= 7 ? 'Menstrual' : cycleDay <= 14 ? 'Follicular' : cycleDay <= 21 ? 'Ovulation' : 'Luteal'
  const phaseColor = phaseLabel === 'Menstrual' ? 'rose' : 'sage'

  return (
    <div className="min-h-screen bg-neutral-0">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-sage-50 to-sage-100 border-b border-sage-200">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-neutral-700 mb-1">
                  Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-neutral-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Health Status Indicator */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-sage-200">
                <div className={`w-3 h-3 rounded-full ${
                  stats.dailyLoad <= 30 ? 'bg-green-400' :
                  stats.dailyLoad <= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm font-medium text-neutral-600">
                  {stats.dailyLoad <= 30 ? 'Excellent Day' :
                   stats.dailyLoad <= 60 ? 'Good Progress' : 'Needs Attention'}
                </span>
              </div>
              
              <button
                onClick={() => signOut({ redirect: true, redirectTo: '/' })}
                className="flex items-center gap-2 px-4 py-2 text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all hover:shadow-md"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        
        {/* Enhanced Cycle Ring & Phase */}
        <div className="bg-gradient-to-br from-white to-sage-50 border border-sage-200 rounded-xl p-8 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Enhanced SVG Cycle Ring */}
            <div className="flex-shrink-0 relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-sage-200 to-sage-300 rounded-full blur-xl opacity-30 animate-pulse"></div>
              
              <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-lg relative z-10">
                {/* Background circle */}
                <circle cx="120" cy="120" r="100" fill="none" stroke="#E2E0DB" strokeWidth="2" opacity="0.3" />
                
                {/* Animated phase segments */}
                <circle 
                  cx="120" cy="120" r="85" fill="none" stroke="#D98C8C" strokeWidth="8" 
                  strokeDasharray="66 334" strokeLinecap="round" opacity="0.8"
                  className={phaseLabel === 'Menstrual' ? 'animate-pulse' : ''}
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    dur="20s"
                    values="0 120 120;360 120 120"
                    repeatCount="indefinite"
                  />
                </circle>
                
                <circle 
                  cx="120" cy="120" r="85" fill="none" stroke="#7BAE9F" strokeWidth="8" 
                  strokeDasharray="66 334" strokeLinecap="round" strokeDashoffset="-66" opacity="0.7"
                  className={phaseLabel === 'Follicular' ? 'animate-pulse' : ''}
                />
                
                <circle 
                  cx="120" cy="120" r="85" fill="none" stroke="#4A7C6F" strokeWidth="8" 
                  strokeDasharray="66 334" strokeLinecap="round" strokeDashoffset="-132"
                  className={phaseLabel === 'Ovulation' ? 'animate-pulse' : ''}
                />
                
                <circle 
                  cx="120" cy="120" r="85" fill="none" stroke="#D4EBE5" strokeWidth="8" 
                  strokeDasharray="66 334" strokeLinecap="round" strokeDashoffset="-198" opacity="0.6"
                  className={phaseLabel === 'Luteal' ? 'animate-pulse' : ''}
                />
                
                {/* Enhanced center */}
                <circle cx="120" cy="120" r="45" fill="url(#centerGradient)" />
                <defs>
                  <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D4EBE5" />
                    <stop offset="100%" stopColor="#A8D4CB" />
                  </radialGradient>
                </defs>
                
                {/* Day text with better styling */}
                <text x="120" y="115" textAnchor="middle" className="text-sm font-semibold fill-sage-700">Day</text>
                <text x="120" y="135" textAnchor="middle" className="text-2xl font-bold fill-sage-800">{cycleDay}</text>
              </svg>
            </div>

            {/* Enhanced Phase Info */}
            <div className="flex-1 max-w-md">
              <div className="mb-8">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 ${
                  phaseColor === 'rose'
                    ? 'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-700 border border-rose-300'
                    : 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 border border-sage-300'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    phaseColor === 'rose' ? 'bg-rose-400' : 'bg-sage-400'
                  } animate-pulse`}></div>
                  <span className="font-semibold text-sm">{phaseLabel} Phase</span>
                </div>
                
                <h2 className="text-3xl font-semibold text-neutral-700 mb-3">
                  Cycle day {cycleDay} of 28
                </h2>
                <p className="text-neutral-600 text-lg mb-6">
                  You're in your {phaseLabel.toLowerCase()} phase
                </p>

                {/* Progress bar for cycle */}
                <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      phaseColor === 'rose' 
                        ? 'bg-gradient-to-r from-rose-400 to-rose-500' 
                        : 'bg-gradient-to-r from-sage-400 to-sage-500'
                    }`}
                    style={{ width: `${(cycleDay / 28) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  {Math.round((cycleDay / 28) * 100)}% through current cycle
                </p>
              </div>

              {/* Enhanced phase-specific tips */}
              <div className="space-y-3">
                {phaseLabel === 'Menstrual' && (
                  <div className="bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-rose-600 text-sm">💧</span>
                      </div>
                      <div>
                        <p className="font-medium text-rose-800 mb-1">Menstrual Phase Tips</p>
                        <p className="text-sm text-rose-700">Focus on iron-rich foods and stay hydrated. Rest is important during your cycle.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {phaseLabel === 'Follicular' && (
                  <div className="bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sage-600 text-sm">🌱</span>
                      </div>
                      <div>
                        <p className="font-medium text-sage-800 mb-1">Follicular Phase Tips</p>
                        <p className="text-sm text-sage-700">Energy is rising — perfect time for new nutrition goals and fresh starts!</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {phaseLabel === 'Ovulation' && (
                  <div className="bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sage-600 text-sm">⚡</span>
                      </div>
                      <div>
                        <p className="font-medium text-sage-800 mb-1">Ovulation Phase Tips</p>
                        <p className="text-sm text-sage-700">Peak energy and confidence! Ensure adequate protein for sustained energy.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {phaseLabel === 'Luteal' && (
                  <div className="bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sage-600 text-sm">🥑</span>
                      </div>
                      <div>
                        <p className="font-medium text-sage-800 mb-1">Luteal Phase Tips</p>
                        <p className="text-sm text-sage-700">Support mood and energy with complex carbs and healthy fats.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Daily Load Score */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-neutral-600">{stats.dailyLoad}</div>
                <div className="text-xs text-neutral-500">Daily Load</div>
              </div>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  stats.dailyLoad <= 30 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  stats.dailyLoad <= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                  'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
                style={{ width: `${Math.min(stats.dailyLoad, 100)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              {stats.dailyLoad <= 30 && '🌟 Excellent choices!'}
              {stats.dailyLoad > 30 && stats.dailyLoad <= 60 && '📈 Room for improvement'}
              {stats.dailyLoad > 60 && '⚠️ Consider adjusting'}
            </p>
          </div>

          {/* Water Intake */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-neutral-600">{stats.waterIntake}/8</div>
                <div className="text-xs text-neutral-500">Glasses</div>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1 mb-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i < stats.waterIntake ? 'bg-gradient-to-t from-blue-400 to-blue-500' : 'bg-neutral-200'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              💧 {stats.waterIntake >= 8 ? 'Goal achieved!' : `${8 - stats.waterIntake} more to go`}
            </p>
          </div>

          {/* Weekly Average */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-neutral-600">{stats.weeklyAverage}</div>
                <div className="text-xs text-neutral-500">Avg Score</div>
              </div>
            </div>
            <div className="flex gap-1 mb-2">
              {stats.weeklyProgress.map((score, i) => (
                <div
                  key={i}
                  className="flex-1 bg-neutral-200 rounded-full overflow-hidden"
                >
                  <div 
                    className="bg-gradient-to-t from-purple-400 to-purple-500 rounded-full transition-all duration-700"
                    style={{ 
                      height: '12px',
                      width: `${(score / 10) * 100}%`,
                      animationDelay: `${i * 150}ms`
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-600 font-medium">📊 Weekly trend</p>
          </div>

          {/* Achievement Streak */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-neutral-600">{stats.streak}</div>
                <div className="text-xs text-neutral-500">Day Streak</div>
              </div>
            </div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < stats.streak ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-600 font-medium">🔥 Keep it up!</p>
          </div>
        </div>

        {/* Enhanced Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Calories */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-700">{stats.calorieTotal}</div>
                <div className="text-sm text-orange-600 font-medium">Calories Today</div>
                <div className="text-xs text-orange-500">Goal: {stats.calorieGoal} cal</div>
              </div>
            </div>
          </div>

          {/* Total Water */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <Droplets className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700">{stats.waterTotal}ml</div>
                <div className="text-sm text-blue-600 font-medium">Water Today</div>
                <div className="text-xs text-blue-500">Goal: {stats.waterGoal}ml</div>
              </div>
            </div>
          </div>

          {/* Today's Entries */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-700">{stats.calorieEntries + stats.waterEntries}</div>
                <div className="text-sm text-indigo-600 font-medium">Today's Logs</div>
                <div className="text-xs text-indigo-500">{stats.calorieEntries} food + {stats.waterEntries} water</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-700 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Scan Product */}
            <Link
              href="/scan"
              className="group bg-sage-50 hover:bg-sage-100 border border-sage-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-sage-400 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-sage-700 mb-1">Scan Product</h4>
              <p className="text-xs text-sage-600">Quick analysis</p>
            </Link>

            {/* Track Food */}
            <Link
              href="/track-food"
              className="group bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-orange-700 mb-1">Track Food</h4>
              <p className="text-xs text-orange-600">Log calories</p>
            </Link>

            {/* Track Water */}
            <Link
              href="/track-water"
              className="group bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-blue-700 mb-1">Track Water</h4>
              <p className="text-xs text-blue-600">Log hydration</p>
            </Link>

            {/* Health Chat */}
            <Link
              href="/health-chat"
              className="group bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-purple-700 mb-1">Health Chat</h4>
              <p className="text-xs text-purple-600">Ask questions</p>
            </Link>

            {/* Insights */}
            <Link
              href="/insights"
              className="group bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-emerald-700 mb-1">Insights</h4>
              <p className="text-xs text-emerald-600">View reports</p>
            </Link>

            {/* Medical Reports */}
            <Link
              href="/medical-reports"
              className="group bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-rose-700 mb-1">Reports</h4>
              <p className="text-xs text-rose-600">Upload files</p>
            </Link>

            {/* Profile Settings */}
            <Link
              href="/profile"
              className="group bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-indigo-700 mb-1">Profile</h4>
              <p className="text-xs text-indigo-600">Edit settings</p>
            </Link>

            {/* Track Combined */}
            <Link
              href="/track"
              className="group bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-teal-700 mb-1">Track All</h4>
              <p className="text-xs text-teal-600">Food + Water</p>
            </Link>
          </div>
        </div>

        {/* Hormonal Insights Section */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-2 border-rose-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-800">Hormonal Health Analytics</h3>
                <p className="text-sm text-neutral-600">Visual insights for your cycle phase</p>
              </div>
            </div>
            <Link
              href="/insights"
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-semibold text-sm shadow-md"
            >
              View Details →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cycle Progress Ring Chart */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-rose-100">
              <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                Cycle Progress
              </h4>
              
              <div className="relative w-48 h-48 mx-auto mb-4">
                {/* SVG Ring Chart */}
                <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
                  {/* Background ring */}
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#fee2e2"
                    strokeWidth="16"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="16"
                    strokeDasharray={`${(cycleDay / 28) * 502.4} 502.4`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-neutral-800">Day {cycleDay}</span>
                  <span className="text-sm text-neutral-500">of 28</span>
                  <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                    phaseLabel === 'Menstrual' ? 'bg-rose-100 text-rose-700' :
                    phaseLabel === 'Follicular' ? 'bg-green-100 text-green-700' :
                    phaseLabel === 'Ovulation' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {phaseLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-sm text-neutral-600">
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(cycleDay / 28) * 100}%` }}
                  />
                </div>
                <span className="font-bold text-neutral-700 ml-2">{Math.round((cycleDay / 28) * 100)}%</span>
              </div>
            </div>

            {/* Hormonal Levels Bar Chart */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-rose-100">
              <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                Hormone Levels
              </h4>

              <div className="space-y-4">
                {/* Estrogen */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Estrogen</span>
                    <span className="text-xs font-bold text-purple-600">
                      {phaseLabel === 'Follicular' || phaseLabel === 'Ovulation' ? 'High' : 'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${
                          phaseLabel === 'Menstrual' ? 20 :
                          phaseLabel === 'Follicular' ? 70 :
                          phaseLabel === 'Ovulation' ? 95 : 40
                        }%` 
                      }}
                    />
                  </div>
                </div>

                {/* Progesterone */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Progesterone</span>
                    <span className="text-xs font-bold text-orange-600">
                      {phaseLabel === 'Luteal' ? 'High' : 'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${
                          phaseLabel === 'Luteal' ? 90 :
                          phaseLabel === 'Ovulation' ? 30 : 15
                        }%` 
                      }}
                    />
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Energy Level</span>
                    <span className="text-xs font-bold text-green-600">
                      {phaseLabel === 'Ovulation' ? 'Peak' : phaseLabel === 'Follicular' ? 'High' : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${
                          phaseLabel === 'Menstrual' ? 45 :
                          phaseLabel === 'Follicular' ? 75 :
                          phaseLabel === 'Ovulation' ? 100 : 55
                        }%` 
                      }}
                    />
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Mood Stability</span>
                    <span className="text-xs font-bold text-blue-600">
                      {phaseLabel === 'Ovulation' || phaseLabel === 'Follicular' ? 'Stable' : 'Variable'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-cyan-600 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${
                          phaseLabel === 'Menstrual' ? 50 :
                          phaseLabel === 'Follicular' ? 80 :
                          phaseLabel === 'Ovulation' ? 90 : 60
                        }%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score Gauge */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-rose-100">
              <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                Health Score
              </h4>

              <div className="relative w-48 h-32 mx-auto mb-6">
                {/* Gauge SVG */}
                <svg width="192" height="128" viewBox="0 0 192 128" className="transform">
                  {/* Background arc */}
                  <path
                    d="M 16 96 A 80 80 0 0 1 176 96"
                    fill="none"
                    stroke="#fee2e2"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Colored segments */}
                  <path
                    d="M 16 96 A 80 80 0 0 1 96 16"
                    fill="none"
                    stroke="#fca5a5"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 96 16 A 80 80 0 0 1 146 36"
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 146 36 A 80 80 0 0 1 176 96"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Needle */}
                  <line
                    x1="96"
                    y1="96"
                    x2={96 + 60 * Math.cos((Math.PI / 180) * (180 - (Math.round((100 - stats.dailyLoad) * 0.85) * 1.8)))}
                    y2={96 - 60 * Math.sin((Math.PI / 180) * (180 - (Math.round((100 - stats.dailyLoad) * 0.85) * 1.8)))}
                    stroke="#1f2937"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <circle cx="96" cy="96" r="6" fill="#1f2937" />
                </svg>

                {/* Score display */}
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <div className="text-3xl font-bold text-neutral-800">{Math.round((100 - stats.dailyLoad) * 0.85)}</div>
                  <div className="text-xs text-neutral-500">Overall Score</div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-neutral-700">Nutrition</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-800">
                    {stats.calorieTotal > 0 ? '85' : '50'}/100
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-neutral-700">Hydration</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-800">
                    {Math.round((stats.waterIntake / 8) * 100)}/100
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-neutral-700">Balance</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-800">92/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trend Graph */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-rose-100 mt-6">
            <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
              7-Day Wellness Trend
            </h4>

            <div className="flex items-end justify-between h-40 gap-2">
              {[65, 72, 68, 78, 85, 82, Math.round((100 - stats.dailyLoad) * 0.85)].map((score, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-neutral-100 rounded-t-lg relative overflow-hidden" style={{ height: '140px' }}>
                    <div 
                      className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-1000 ${
                        score >= 80 ? 'bg-gradient-to-t from-green-400 to-emerald-500' :
                        score >= 60 ? 'bg-gradient-to-t from-blue-400 to-blue-500' :
                        'bg-gradient-to-t from-orange-400 to-red-500'
                      }`}
                      style={{ 
                        height: `${(score / 100) * 100}%`,
                        animationDelay: `${idx * 100}ms`
                      }}
                    />
                    <div className="absolute top-2 left-0 right-0 text-center">
                      <span className="text-xs font-bold text-neutral-700 bg-white px-2 py-1 rounded shadow-sm">
                        {score}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-neutral-600">
                    {idx === 6 ? 'Today' : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
