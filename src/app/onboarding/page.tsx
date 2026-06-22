'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { User, Heart, Target, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Upload, X, CheckCircle } from 'lucide-react'

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
}

export default function Onboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
        setUploadedReports(prev => [...prev, { id: data.report.id, fileName: data.report.fileName }])
      } catch (err) {
        setUploadError(`Failed to upload ${file.name}: ${String(err)}`)
      }
    }

    setUploading(false)
    // Reset file input
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-3xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-neutral-600 mb-2">Create Your Health Profile</h1>
          <p className="text-neutral-600 opacity-75">Help us understand your health conditions for personalized nutrition insights</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <h3 className="text-lg font-medium text-neutral-600 mb-6">Basic Information</h3>

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
                <div className="text-sm font-medium text-neutral-600 mb-2">Sex</div>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
          </div>

          {/* Blood Reports Upload Section */}
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <h3 className="text-lg font-medium text-neutral-600 mb-6">Blood Reports (Optional)</h3>
            
            {/* Upload Area */}
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-sage-200 rounded-lg p-8 text-center cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition">
                  <Upload className="w-8 h-8 text-sage-400 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-neutral-600 font-medium mb-1">Upload blood reports</p>
                  <p className="text-sm text-neutral-500">PDF or image files (max 10MB each)</p>
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

            {/* Uploaded Files */}
            {uploadedReports.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-600">Uploaded Reports ({uploadedReports.length})</p>
                {uploadedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between bg-sage-50 p-4 rounded-lg border border-sage-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-sage-600" strokeWidth={2} />
                      <span className="text-sm text-neutral-600 font-medium">{report.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReport(report.id)}
                      className="text-rose-600 hover:text-rose-700 transition"
                    >
                      <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="text-sm text-sage-600 font-medium">Uploading...</div>
            )}
          </div>

          {/* Health Conditions Section */}
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <h3 className="text-lg font-medium text-neutral-600 mb-2">Health Conditions</h3>
            <p className="text-sm text-neutral-500 mb-6">Select any that apply</p>
            
            <div className="grid grid-cols-1 gap-4">
              {CONDITIONS.map(condition => (
                <label key={condition.name} className="flex items-start gap-4 p-4 border border-neutral-200 rounded-lg hover:border-sage-300 hover:bg-sage-50 transition cursor-pointer">
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
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <h3 className="text-lg font-medium text-neutral-600 mb-2">Health Goals</h3>
            <p className="text-sm text-neutral-500 mb-6">Select any that apply</p>
            
            <div className="space-y-3">
              {GOALS.map(goal => (
                <label key={goal} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={() => toggleGoal(goal)}
                    className="w-5 h-5 rounded text-sage-600 border-neutral-300 focus:ring-sage-500 cursor-pointer"
                  />
                  <span className="text-neutral-600">{goal}</span>
                </label>
              ))}
            </div>
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
            disabled={loading || !formData.name}
            className="w-full bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving Profile...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}
