'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Save, User, Mail, Calendar as CalendarIcon, Heart, Target, Loader2 } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  age: number | null
  sex: string | null
  conditions: string | null
  goals: string | null
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    conditions: '',
    goals: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (session?.user?.id) {
          const response = await fetch('/api/user/profile')
          const data = await response.json()

          if (data.ok && data.user) {
            setProfile(data.user)
            setFormData({
              name: data.user.name || '',
              age: data.user.age?.toString() || '',
              sex: data.user.sex || '',
              conditions: data.user.conditions || '',
              goals: data.user.goals || ''
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        setMessage({ type: 'error', text: 'Failed to load profile' })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          sex: formData.sex || null,
          conditions: formData.conditions || null,
          goals: formData.goals || null
        })
      })

      const data = await response.json()

      if (data.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setProfile({ ...profile!, ...data.user })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: 'An error occurred while updating profile' })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-neutral-0">
        <div className="text-center">
          <div className="inline-block w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-sage-700 rounded-full animate-spin" />
          </div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-700">Profile Settings</h1>
            <p className="text-neutral-500 text-sm mt-1">Manage your account and preferences</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sage-600 hover:text-sage-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {formData.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-neutral-700">{formData.name || 'User'}</h2>
                <p className="text-sm text-neutral-500 mt-1">{profile?.email}</p>
              </div>

              <div className="space-y-3 pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs">Member since</p>
                    <p className="text-neutral-700 font-medium">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {formData.age && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">Age</p>
                      <p className="text-neutral-700 font-medium">{formData.age} years</p>
                    </div>
                  </div>
                )}

                {formData.sex && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">Sex</p>
                      <p className="text-neutral-700 font-medium">{formData.sex}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-700 mb-6">Personal Information</h3>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-2.5">
                      <Mail className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Age and Sex */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="25"
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Sex
                    </label>
                    <select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Health Conditions */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Health Conditions
                  </label>
                  <textarea
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="e.g., PCOS, Diabetes, Thyroid issues (separate with commas)"
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 placeholder-neutral-400 resize-none"
                  />
                  <p className="text-xs text-neutral-500 mt-1">List any health conditions, separated by commas</p>
                </div>

                {/* Health Goals */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Health Goals
                  </label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="e.g., Weight loss, Better nutrition, Hormonal balance (separate with commas)"
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 placeholder-neutral-400 resize-none"
                  />
                  <p className="text-xs text-neutral-500 mt-1">List your health goals, separated by commas</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving || !formData.name.trim()}
                    className="flex-1 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>

                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium transition text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>

            {/* Additional Info Section */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Why we need this information</h4>
                  <p className="text-sm text-blue-700">
                    Your profile information helps us provide personalized nutrition recommendations 
                    and insights tailored to your specific health conditions and goals. All data is 
                    kept private and secure.
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
