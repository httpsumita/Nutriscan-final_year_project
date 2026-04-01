'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const CONDITIONS = [
  'PCOS',
  'Thyroid',
  'Insulin resistance',
  'Menopause',
  'Type 2 diabetes'
]

const GOALS = [
  'Weight management',
  'Hormone balance',
  'Energy optimization',
  'Reduce inflammation',
  'Improve digestion'
]

export default function Onboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'Female',
    conditions: [] as string[],
    goals: [] as string[]
  })

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }))
  }

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age) || 0,
          sex: formData.sex,
          conditions: formData.conditions,
          goals: formData.goals
        })
      })

      if (!response.ok) throw new Error('Failed to save profile')
      router.push('/dashboard')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-2xl font-bold mb-6">Create Your Health Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

          <label className="block mb-4">
            <div className="text-sm font-medium mb-1">Name *</div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-sm font-medium mb-1">Age</div>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium mb-1">Sex</div>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Health Conditions</h3>
          <p className="text-sm text-slate-600 mb-3">Select any that apply</p>
          <div className="space-y-2">
            {CONDITIONS.map(condition => (
              <label key={condition} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.conditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="rounded"
                />
                <span className="ml-2 text-sm">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Health Goals</h3>
          <p className="text-sm text-slate-600 mb-3">Select any that apply</p>
          <div className="space-y-2">
            {GOALS.map(goal => (
              <label key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() => toggleGoal(goal)}
                  className="rounded"
                />
                <span className="ml-2 text-sm">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
      </div>
    </div>
  )
}
