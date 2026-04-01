'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    dailyLoad: 42,
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
        // Fetch today's daily summary
        const dailyResponse = await fetch(
          `/api/daily-summary?userId=${session?.user?.id}`
        )
        const dailyData = await dailyResponse.json()

        // In production, fetch actual recent scans
        setStats({
          dailyLoad: dailyData.log?.hormonalLoadScore || 0,
          recentScans: []
        })
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
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-6 px-6"
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-slate-600">{session?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ redirect: true, redirectTo: '/' })}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>

      {/* Daily Hormonal Load */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
        <p className="text-slate-700 mb-2">Daily Hormonal Load Score</p>
        <div className="text-5xl font-bold text-blue-600 mb-2">{stats.dailyLoad}</div>
        <p className="text-sm text-slate-600">
          {stats.dailyLoad <= 30 && '✓ Great choices today!'}
          {stats.dailyLoad > 30 && stats.dailyLoad <= 60 && '◐ Room for improvement'}
          {stats.dailyLoad > 60 && '⚠ Consider adjusting your choices'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">Water Intake</p>
          <div className="text-2xl font-bold mt-2">6/8 glasses</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">Scans Today</p>
          <div className="text-2xl font-bold mt-2">{stats.recentScans.length}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/scan"
          className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          📷 Scan Food Product
        </Link>
        <Link
          href="/onboarding"
          className="block w-full text-center px-4 py-3 border rounded-lg hover:bg-slate-50 transition"
        >
          Update Profile
        </Link>
        <Link
          href="/api/insights"
          className="block w-full text-center px-4 py-3 border rounded-lg hover:bg-slate-50 transition"
        >
          View Insights
        </Link>
      </div>
      </div>
    </div>
  )
}
