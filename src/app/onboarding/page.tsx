'use client'

import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import { FormEvent, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, X, Loader2, Leaf } from 'lucide-react'
=======
import { FormEvent, useState } from 'react'
import { User, Heart, Target, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Upload, X, CheckCircle } from 'lucide-react'
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c

const CONDITIONS = [
  { name: 'PCOS', description: 'Polycystic Ovary Syndrome' },
  { name: 'Thyroid', description: 'Thyroid disorder or dysfunction' },
  { name: 'Insulin resistance', description: 'Insulin resistance or prediabetes' },
  { name: 'Menopause', description: 'Menopause or perimenopause' },
  { name: 'Type 2 diabetes', description: 'Type 2 Diabetes' }
]

const GOALS = [
  'Weight management',
  'Hormone balance',
  'Energy optimization',
  'Reduce inflammation',
  'Improve digestion'
]

interface UploadedReport {
  id: string
  fileName: string
  analysisResult?: any
}

export default function Onboarding() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'Female',
    conditions: [] as string[],
    goals: [] as string[]
  })

  // Fetch existing user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (status === 'unauthenticated') {
          router.push('/auth/signin')
          return
        }

        if (session?.user?.id) {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setFormData({
                name: data.user.name || '',
                age: data.user.age?.toString() || '',
                sex: data.user.sex || 'Female',
                conditions: data.user.conditions || [],
                goals: data.user.goals || []
              })

              // Fetch medical reports
              const reportsResponse = await fetch('/api/medical-reports')
              if (reportsResponse.ok) {
                const reportsData = await reportsResponse.json()
                if (reportsData.reports) {
                  setUploadedReports(
                    reportsData.reports.map((r: any) => ({
                      id: r.id,
                      fileName: r.fileName || 'Medical Report',
                      analysisResult: r.analysisResult
                    }))
                  )
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchUserData()
  }, [session, status, router])

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    setUploadError('')

    for (const file of Array.from(files)) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const response = await fetch('/api/upload-medical-report', {
          method: 'POST',
          body: formDataUpload
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        setUploadedReports(prev => [...prev, {
          id: data.report.id,
          fileName: data.report.fileName,
          analysisResult: data.report.analysisResult
        }])

        // Auto-detect conditions and merge
        if (data.report.analysisResult?.detectedConditions?.length > 0) {
          setFormData(prev => ({
            ...prev,
            conditions: Array.from(
              new Set([...prev.conditions, ...data.report.analysisResult.detectedConditions])
            ),
          }))
        }
      } catch (err) {
        setUploadError(`Failed to upload ${file.name}: ${String(err)}`)
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const removeReport = (id: string) => {
    setUploadedReports(prev => prev.filter(r => r.id !== id))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.name) {
        throw new Error('Name is required')
      }

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age) || 0,
          sex: formData.sex,
          conditions: formData.conditions,
          goals: formData.goals,
          medicalReportIds: uploadedReports.map(r => r.id)
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

  if (status === 'loading' || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-neutral-0">
        <div className="text-center">
          <div className="inline-block w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
          </div>
          <p className="text-neutral-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-3xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-sage-400 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-medium text-neutral-600">NutriScan</span>
          </div>
          <h1 className="text-4xl font-semibold text-neutral-700 mb-2">Your Health Profile</h1>
          <p className="text-neutral-600 opacity-75">Update and manage your health information for personalized nutrition insights</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-700 mb-6">Personal Information</h3>

            <label className="block mb-6">
              <div className="text-sm font-medium text-neutral-600 mb-2">Full Name *</div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                placeholder="Your name"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-6">
              <label className="block">
                <div className="text-sm font-medium text-neutral-600 mb-2">Age</div>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                  placeholder="25"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-neutral-600 mb-2">Gender</div>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
            </div>
          </div>

          {/* Health Conditions Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">Health Conditions</h3>
            <p className="text-sm text-neutral-500 mb-6">Select any that apply to you</p>
            
            <div className="grid grid-cols-1 gap-4">
              {CONDITIONS.map(condition => (
                <label key={condition.name} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition ${
                  formData.conditions.includes(condition.name)
                    ? 'border-sage-400 bg-sage-50'
                    : 'border-neutral-200 hover:border-sage-300 hover:bg-sage-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.conditions.includes(condition.name)}
                    onChange={() => toggleCondition(condition.name)}
                    className="mt-1.5 w-5 h-5 rounded text-sage-600 border-neutral-300 focus:ring-sage-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-600">{condition.name}</div>
                    <div className="text-sm text-neutral-500">{condition.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Health Goals Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">Health Goals</h3>
            <p className="text-sm text-neutral-500 mb-6">Select any that apply</p>
            
            <div className="flex flex-wrap gap-3">
              {GOALS.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    formData.goals.includes(goal)
                      ? 'bg-sage-600 text-white border-sage-600'
                      : 'border-neutral-300 text-neutral-600 hover:border-sage-400'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Health Documents Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">Health Documents</h3>
            <p className="text-sm text-neutral-500 mb-6">Upload blood reports or health records (optional)</p>
            
            {/* Upload Area */}
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-sage-200 rounded-xl p-8 text-center cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition">
                  <Upload className="w-8 h-8 text-sage-400 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-neutral-600 font-medium mb-1">Upload health documents</p>
                  <p className="text-sm text-neutral-500">PDF or image files · max 10 MB each</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                {uploadError}
              </div>
            )}

            {/* Uploaded Files with AI Analysis */}
            {uploadedReports.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-neutral-600">Uploaded Reports ({uploadedReports.length})</p>
                {uploadedReports.map((report) => (
                  <div key={report.id} className="bg-sage-50 border border-sage-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-600 truncate">{report.fileName}</p>
                        {report.analysisResult?.keyFindings && (
                          <p className="text-xs text-neutral-500 mt-1">{report.analysisResult.keyFindings}</p>
                        )}
                        {report.analysisResult?.detectedConditions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {report.analysisResult.detectedConditions.map((c: string) => (
                              <span key={c} className="px-2 py-0.5 bg-sage-200 text-sage-700 text-xs rounded-full font-medium">
                                {c} detected
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReport(report.id)}
                        className="text-rose-400 hover:text-rose-600 transition shrink-0"
                      >
                        <X className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-sage-600 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing document with AI...
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading || !formData.name}
            className="w-full bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving Profile...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
