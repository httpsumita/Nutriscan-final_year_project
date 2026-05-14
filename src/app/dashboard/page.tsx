'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Camera, Settings, Zap, BarChart3, LogOut } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    dailyLoad: 35,
    waterIntake: 6,
    recentScans: [] as any[]
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
          const dailyData = await dailyResponse.json()

          setStats({
            dailyLoad: dailyData.log?.hormonalLoadScore || 35,
            waterIntake: 6,
            recentScans: []
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
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-neutral-600">Welcome back, {session?.user?.name}</h1>
            <p className="text-neutral-600 opacity-75 text-sm mt-1">Your daily wellness dashboard</p>
          </div>
          <button
            onClick={() => signOut({ redirect: true, redirectTo: '/' })}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        
        {/* Cycle Ring & Phase */}
        <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* SVG Cycle Ring */}
            <div className="flex-shrink-0">
              <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-md">
                {/* Background circle */}
                <circle cx="100" cy="100" r="85" fill="none" stroke="#E2E0DB" strokeWidth="2" opacity="0.3" />
                
                {/* Phase segments - Menstrual (dusty rose) */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#D98C8C" strokeWidth="6" strokeDasharray="54.95 263.76" strokeLinecap="round" opacity="0.8" />
                
                {/* Follicular (sage light) */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#7BAE9F" strokeWidth="6" strokeDasharray="54.95 263.76" strokeLinecap="round" strokeDashoffset="-54.95" opacity="0.7" />
                
                {/* Ovulation (sage mid) */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#4A7C6F" strokeWidth="6" strokeDasharray="54.95 263.76" strokeLinecap="round" strokeDashoffset="-109.9" />
                
                {/* Luteal (sage light) */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#D4EBE5" strokeWidth="6" strokeDasharray="54.95 263.76" strokeLinecap="round" strokeDashoffset="-164.85" opacity="0.6" />
                
                {/* Center text */}
                <circle cx="100" cy="100" r="35" fill="#D4EBE5" />
                <text x="100" y="105" textAnchor="middle" className="text-sm font-medium fill-sage-700">Day {cycleDay}</text>
              </svg>
            </div>

            {/* Phase Info */}
            <div>
              <div className="mb-8">
                <div className={`inline-block px-4 py-2 rounded-full mb-6 ${
                  phaseColor === 'rose'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-sage-200 text-sage-700'
                }`}>
                  <span className="font-medium text-sm">{phaseLabel} Phase</span>
                </div>
                <h2 className="text-2xl font-medium text-neutral-600">Cycle day {cycleDay} of 28</h2>
                <p className="text-neutral-600 opacity-75 mt-2">You're in your {phaseLabel.toLowerCase()} phase</p>
              </div>

              {/* Phase-specific tips */}
              {phaseLabel === 'Menstrual' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-neutral-600">
                  <p><strong>Tip:</strong> Focus on iron-rich foods and stay hydrated during your cycle.</p>
                </div>
              )}
              {phaseLabel === 'Follicular' && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 text-sm text-neutral-600">
                  <p><strong>Tip:</strong> Energy is rising — great time for new nutrition goals!</p>
                </div>
              )}
              {phaseLabel === 'Ovulation' && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 text-sm text-neutral-600">
                  <p><strong>Tip:</strong> Peak confidence! Ensure adequate protein for sustained energy.</p>
                </div>
              )}
              {phaseLabel === 'Luteal' && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 text-sm text-neutral-600">
                  <p><strong>Tip:</strong> Support mood and energy with complex carbs and healthy fats.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Daily Hormonal Load */}
          <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-6">
            <p className="text-neutral-600 opacity-75 text-sm font-medium mb-3">Daily Load Score</p>
            <div className="text-4xl font-medium text-sage-700 mb-2">{stats.dailyLoad}</div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
              <div 
                className="bg-sage-400 h-2 rounded-full" 
                style={{ width: `${Math.min(stats.dailyLoad, 100)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 opacity-75">
              {stats.dailyLoad <= 30 && '✓ Excellent choices today'}
              {stats.dailyLoad > 30 && stats.dailyLoad <= 60 && '◐ Room for improvement'}
              {stats.dailyLoad > 60 && '⚠ Consider adjusting choices'}
            </p>
          </div>

          {/* Water Intake */}
          <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-6">
            <p className="text-neutral-600 opacity-75 text-sm font-medium mb-3">Water Intake</p>
            <div className="text-4xl font-medium text-sage-700 mb-2">{stats.waterIntake}/8</div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < stats.waterIntake ? 'bg-sage-400' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-600 opacity-75">glasses consumed today</p>
          </div>

          {/* Scans Today */}
          <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-6">
            <p className="text-neutral-600 opacity-75 text-sm font-medium mb-3">Scans Performed</p>
            <div className="text-4xl font-medium text-sage-700 mb-2">{stats.recentScans.length}</div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
              <div 
                className="bg-sage-400 h-2 rounded-full" 
                style={{ width: `${Math.min(stats.recentScans.length * 20, 100)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 opacity-75">products scanned today</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/scan"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-sage-700 text-white rounded-lg font-medium hover:bg-sage-800 transition"
          >
            <Camera className="w-5 h-5" strokeWidth={1.5} />
            Scan Food Product
          </Link>
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-sage-300 text-sage-700 rounded-lg font-medium hover:bg-sage-50 transition"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
            Update Profile
          </Link>
          <Link
            href="/insights"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-sage-300 text-sage-700 rounded-lg font-medium hover:bg-sage-50 transition"
          >
            <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
            View Insights
          </Link>
        </div>
      </div>
    </div>
  )
}
