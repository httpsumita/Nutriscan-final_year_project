'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Plus, Droplets, Utensils, Trash2 } from 'lucide-react'

interface CalorieEntry {
  id: string
  foodName: string
  category: string
  calories: number
  date: string
}

interface WaterEntry {
  id: string
  amount: number
  date: string
}

export default function TrackPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  // Calorie state
  const [foodName, setFoodName] = useState('')
  const [category, setCategory] = useState('Other')
  const [calories, setCalories] = useState('')
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([])
  const [addingCalorie, setAddingCalorie] = useState(false)

  // Water state
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
          // Fetch today's calorie and water logs
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const [calorieRes, waterRes] = await Promise.all([
            fetch(`/api/calorie-logs?date=${today.toISOString()}`),
            fetch(`/api/water-logs?date=${today.toISOString()}`)
          ])

          const calorieData = await calorieRes.json()
          const waterData = await waterRes.json()

          if (calorieData.ok) setCalorieEntries(calorieData.entries)
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

  const handleAddCalorie = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodName.trim() || !calories) return

    setAddingCalorie(true)
    try {
      const response = await fetch('/api/log-calorie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName,
          category,
          calories: parseInt(calories)
        })
      })

      const data = await response.json()
      if (data.ok) {
        setCalorieEntries([...calorieEntries, data.calorieLog])
        setFoodName('')
        setCalories('')
        setCategory('Other')
      }
    } catch (error) {
      console.error('Failed to add calorie:', error)
    } finally {
      setAddingCalorie(false)
    }
  }

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
      }
    } catch (error) {
      console.error('Failed to add water:', error)
    } finally {
      setAddingWater(false)
    }
  }

  const handleDeleteCalorie = async (id: string) => {
    try {
      await fetch(`/api/log-calorie/${id}`, { method: 'DELETE' })
      setCalorieEntries(calorieEntries.filter(e => e.id !== id))
    } catch (error) {
      console.error('Failed to delete calorie:', error)
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

  const totalCalories = calorieEntries.reduce((sum, e) => sum + e.calories, 0)
  const totalWater = waterEntries.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-700">Track Intake</h1>
            <p className="text-neutral-500 text-sm mt-1">Log your daily food and water intake</p>
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
          {/* Calorie Tracker */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Utensils className="w-5 h-5 text-orange-600" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">Calorie Tracker</h2>
              </div>

              {/* Add Calorie Form */}
              <form onSubmit={handleAddCalorie} className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">Food Name</label>
                    <input
                      type="text"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="e.g., Apple, Sandwich"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">Calories</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="e.g., 150"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-neutral-600 bg-white"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addingCalorie || !foodName.trim() || !calories}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {addingCalorie ? 'Adding...' : 'Add Food'}
                </button>
              </form>

              {/* Calorie Entries */}
              {calorieEntries.length > 0 ? (
                <div className="space-y-3">
                  {calorieEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                      <div>
                        <p className="font-medium text-neutral-700">{entry.foodName}</p>
                        <p className="text-xs text-neutral-500">{entry.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-orange-600">{entry.calories} cal</p>
                        <button
                          onClick={() => handleDeleteCalorie(entry.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500 text-sm py-6">No food logged yet. Add your first meal!</p>
              )}
            </div>
          </div>

          {/* Water Tracker & Summary */}
          <div className="lg:col-span-1">
            {/* Water Tracker */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Droplets className="w-5 h-5 text-blue-600" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">Water Intake</h2>
              </div>

              {/* Water Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-600 mb-2">Amount (ml)</label>
                <input
                  type="number"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                  placeholder="250"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
                />
              </div>

              <button
                onClick={handleAddWater}
                disabled={addingWater || !waterAmount}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2 mb-6"
              >
                <Plus className="w-4 h-4" />
                {addingWater ? 'Adding...' : 'Add Water'}
              </button>

              {/* Water Total */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Today's Total</p>
                <p className="text-2xl font-bold text-blue-700">{totalWater} ml</p>
                <p className="text-xs text-blue-600 mt-1">{Math.round(totalWater / 250)} cups</p>
              </div>

              {/* Water Log */}
              <div className="space-y-2">
                {waterEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded hover:bg-neutral-100 transition">
                    <p className="text-sm text-neutral-600">{entry.amount}ml</p>
                    <button
                      onClick={() => handleDeleteWater(entry.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calorie Summary */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Today's Summary</h2>

              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-orange-600 font-medium mb-1">Total Calories</p>
                  <p className="text-2xl font-bold text-orange-700">{totalCalories}</p>
                  <p className="text-xs text-orange-600 mt-1">Daily Goal: 2000 cal</p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-emerald-700">{Math.max(0, 2000 - totalCalories)}</p>
                  <p className="text-xs text-emerald-600 mt-1">{Math.round((totalCalories / 2000) * 100)}% of goal</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${Math.min((totalCalories / 2000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
