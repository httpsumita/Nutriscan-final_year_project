'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Plus, Trash2, Droplets } from 'lucide-react'

interface WaterEntry {
  id: string
  amount: number
  date: string
}

export default function TrackWaterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  const [waterAmount, setWaterAmount] = useState('250')
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([])
  const [addingWater, setAddingWater] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.id) {
          const today = new Date()
          const dateStr = today.toISOString().split('T')[0]

          const waterRes = await fetch(`/api/water-logs?date=${dateStr}`)
          const waterData = await waterRes.json()

          if (waterData.ok) setWaterEntries(waterData.entries)
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchData()
    }
  }, [session])

  const handleAddWater = async () => {
    if (!waterAmount || parseInt(waterAmount) <= 0) return

    setAddingWater(true)
    try {
      const response = await fetch('/api/log-water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(waterAmount)
        })
      })

      const data = await response.json()
      if (data.ok) {
        setWaterEntries([...waterEntries, data.waterLog])
        setWaterAmount('250')
        // Trigger dashboard refresh
        window.dispatchEvent(new Event('waterAdded'))
      }
    } catch (error) {
      console.error('Failed to add water:', error)
    } finally {
      setAddingWater(false)
    }
  }

  const handleDeleteWater = async (id: string) => {
    try {
      await fetch(`/api/log-water/${id}`, { method: 'DELETE' })
      setWaterEntries(waterEntries.filter(e => e.id !== id))
    } catch (error) {
      console.error('Failed to delete water:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-neutral-0">
        <div className="text-center">
          <div className="inline-block w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-sage-700 rounded-full animate-spin" />
          </div>
          <p className="text-neutral-600">Loading tracker...</p>
        </div>
      </div>
    )
  }

  const totalWater = waterEntries.reduce((sum, e) => sum + e.amount, 0)
  const dailyGoal = 2000 // 2 liters in ml

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-700">Track Water Intake</h1>
            <p className="text-neutral-500 text-sm mt-1">Log your daily water consumption</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sage-600 hover:text-sage-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Water Tracker */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Droplets className="w-5 h-5 text-blue-600" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">Add Water</h2>
              </div>

              {/* Water Amount Input */}
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <label className="block text-sm font-medium text-neutral-600 mb-3">Amount (ml)</label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="number"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(e.target.value)}
                    placeholder="250"
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
                  />
                  <button
                    onClick={handleAddWater}
                    disabled={addingWater || !waterAmount}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {addingWater ? 'Adding...' : 'Add'}
                  </button>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[250, 500, 750, 1000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWaterAmount(String(amount))}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
                    >
                      {amount / 250} cup{amount !== 250 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Water Log */}
              {waterEntries.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-700 mb-4">Today's Water Log</h3>
                  {waterEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                      <p className="text-sm text-neutral-600">{entry.amount} ml</p>
                      <button
                        onClick={() => handleDeleteWater(entry.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500 text-sm py-6">No water logged yet. Stay hydrated!</p>
              )}
            </div>
          </div>

          {/* Water Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Today's Summary</h2>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Water</p>
                  <p className="text-2xl font-bold text-blue-700">{totalWater} ml</p>
                  <p className="text-xs text-blue-600 mt-1">{Math.round(totalWater / 250)} cups</p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-emerald-700">{Math.max(0, dailyGoal - totalWater)} ml</p>
                  <p className="text-xs text-emerald-600 mt-1">Daily Goal: {dailyGoal} ml</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min((totalWater / dailyGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-600">{Math.round((totalWater / dailyGoal) * 100)}% of daily goal</p>
                </div>

                {/* Hydration Status */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 text-center">
                  <p className="text-2xl mb-2">
                    {totalWater < dailyGoal / 2 ? '💧' : totalWater < dailyGoal ? '💧💧' : '✨'}
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    {totalWater < dailyGoal / 2 ? 'Keep going!' : totalWater < dailyGoal ? 'Almost there!' : 'Goal reached! 🎉'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
