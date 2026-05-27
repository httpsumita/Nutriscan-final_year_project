'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { ArrowLeft, TrendingUp, Activity, Star, Package } from 'lucide-react'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
)

export default function InsightsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    const fetchInsights = async () => {
      if (!session?.user?.id) return
      try {
        const res = await fetch(`/api/insights?userId=${session.user.id}`)
        const json = await res.json()
        if (json.ok) setData(json)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (session?.user?.id) fetchInsights()
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">Loading insights...</div>
      </div>
    )
  }

  const labels = data?.chartData?.labels || []
  const hormonalLoadData = data?.chartData?.hormonalLoadData || []
  const scansPerDay = data?.chartData?.scansPerDay || []
  const avgScorePerDay = data?.chartData?.avgScorePerDay || []

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Hormonal Load Score',
        data: hormonalLoadData,
        borderColor: '#4A7C6F',
        backgroundColor: 'rgba(74, 124, 111, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4A7C6F',
        pointRadius: 5
      }
    ]
  }

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Avg Compatibility Score',
        data: avgScorePerDay,
        backgroundColor: 'rgba(74, 124, 111, 0.7)',
        borderRadius: 6
      },
      {
        label: 'Scans Per Day',
        data: scansPerDay,
        backgroundColor: 'rgba(217, 140, 140, 0.7)',
        borderRadius: 6
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex items-center gap-4">
          <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium text-neutral-700">Weekly Insights</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Your last 7 days of nutrition data</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 space-y-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-4">
            <div className="bg-sage-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-sage-700" style={{ color: '#4A7C6F' }} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg Hormonal Load</p>
              <p className="text-3xl font-semibold text-neutral-700">{data?.summary?.avgHormonalLoad ?? 0}</p>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Scans</p>
              <p className="text-3xl font-semibold text-neutral-700">{data?.summary?.totalScans ?? 0}</p>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg Compatibility</p>
              <p className="text-3xl font-semibold text-neutral-700">{data?.summary?.avgCompatibilityScore ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Line Chart — Hormonal Load */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="text-lg font-medium text-neutral-700 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#4A7C6F' }} />
            Daily Hormonal Load (Last 7 Days)
          </h2>
          <Line data={lineChartData} options={chartOptions} />
        </div>

        {/* Bar Chart — Scans & Scores */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="text-lg font-medium text-neutral-700 mb-6">
            Scans & Compatibility Scores
          </h2>
          <Bar data={barChartData} options={chartOptions} />
        </div>

        {/* Top Products */}
        {data?.topProducts?.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h2 className="text-lg font-medium text-neutral-700 mb-4">Most Scanned Products</h2>
            <div className="space-y-3">
              {data.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-600">{p.name}</span>
                  <span className="text-sm font-medium px-3 py-1 bg-neutral-100 rounded-full text-neutral-500">
                    {p.count} scan{p.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Tips */}
        {data?.insights?.weekly?.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h2 className="text-lg font-medium text-neutral-700 mb-4">Weekly Tips</h2>
            <div className="space-y-3">
              {data.insights.weekly.map((tip: any, i: number) => (
                <div key={i} className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="font-medium text-green-800">{tip.title}</p>
                  <p className="text-sm text-green-700 mt-1">{tip.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}