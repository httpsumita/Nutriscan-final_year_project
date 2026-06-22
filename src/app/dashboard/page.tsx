'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Camera, Settings, Zap, BarChart3, LogOut, TrendingUp, Calendar, Droplets, Activity, Award, Target, FileText, MessageCircle } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    dailyLoad: 35,
    waterIntake: 6,
    recentScans: [] as any[],
    weeklyAverage: 7.2,
    streak: 5,
    totalScans: 127,
    bestScore: 9.5,
    weeklyProgress: [6.2, 7.1, 6.8, 7.9, 8.2, 7.5, 7.2]
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
          const dailyResponse = await fetch(
            `/api/daily-summary?userId=${session.user.id}`
          )
          
          let dailyData = {}
          if (dailyResponse.ok) {
            try {
              dailyData = await dailyResponse.json()
            } catch (jsonError) {
              console.log('No daily data available yet')
            }
          }

          setStats({
            dailyLoad: dailyData.log?.hormonalLoadScore || 35,
            waterIntake: 6,
            recentScans: [],
            weeklyAverage: 7.2,
            streak: 5,
            totalScans: 127,
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
          {/* Total Scans Achievement */}
          <div className="bg-gradient-to-br from-sage-50 to-sage-100 border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-bold text-sage-700">{stats.totalScans}</div>
                <div className="text-sm text-sage-600 font-medium">Total Scans</div>
                <div className="text-xs text-sage-500">Lifetime achievement</div>
              </div>
            </div>
          </div>

          {/* Best Score */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Target className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-700">{stats.bestScore}</div>
                <div className="text-sm text-amber-600 font-medium">Best Score</div>
                <div className="text-xs text-amber-500">Personal record</div>
              </div>
            </div>
          </div>

          {/* Today's Scans */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-700">{stats.recentScans.length}</div>
                <div className="text-sm text-indigo-600 font-medium">Today's Scans</div>
                <div className="text-xs text-indigo-500">Products analyzed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
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
              className="group bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-blue-700 mb-1">Insights</h4>
              <p className="text-xs text-blue-600">View reports</p>
            </Link>

            {/* Medical Reports */}
            <Link
              href="/medical-reports"
              className="group bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h4 className="font-medium text-emerald-700 mb-1">Reports</h4>
              <p className="text-xs text-emerald-600">Upload files</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
