'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, Upload, X, CheckCircle, ChevronRight, ChevronLeft, Loader2, FileText } from 'lucide-react'

const CONDITIONS = [
  { name: 'PCOS', description: 'Polycystic Ovary Syndrome', icon: '🔴' },
  { name: 'Thyroid', description: 'Thyroid disorder or dysfunction', icon: '🟡' },
  { name: 'Insulin resistance', description: 'Insulin resistance or prediabetes', icon: '🟠' },
  { name: 'Menopause', description: 'Menopause or perimenopause', icon: '🟣' },
  { name: 'Type 2 diabetes', description: 'Type 2 Diabetes', icon: '🔵' },
]

const GOALS = [
  'Weight management',
  'Hormone balance',
  'Energy optimization',
  'Reduce inflammation',
  'Improve digestion',
]

interface UploadedDoc {
  id: string
  fileName: string
  analysisResult?: {
    detectedConditions: string[]
    keyFindings: string
    recommendations: string[]
  }
}

export default function SignUp() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: account, 2: personal info, 3: conditions, 4: documents
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    sex: 'Female',
    conditions: [] as string[],
    goals: [] as string[],
  })

  const toggleCondition = (c: string) =>
    setForm(prev => ({
      ...prev,
      conditions: prev.conditions.includes(c)
        ? prev.conditions.filter(x => x !== c)
        : [...prev.conditions, c],
    }))

  const toggleGoal = (g: string) =>
    setForm(prev => ({
      ...prev,
      goals: prev.goals.includes(g)
        ? prev.goals.filter(x => x !== g)
        : [...prev.goals, g],
    }))

  // Step 1 validation
  const step1Valid =
    form.email.includes('@') &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword

  // Step 2 validation
  const step2Valid = form.name.trim().length > 0

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    setUploadError('')

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData()
        fd.append('file', file)

        const res = await fetch('/api/upload-medical-report', {
          method: 'POST',
          body: fd,
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Upload failed')

        setUploadedDocs(prev => [
          ...prev,
          {
            id: data.report.id,
            fileName: file.name,
            analysisResult: data.report.analysisResult,
          },
        ])

        // Auto-detect conditions from report and merge into form
        if (data.report.analysisResult?.detectedConditions?.length > 0) {
          setForm(prev => ({
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

  const removeDoc = (id: string) =>
    setUploadedDocs(prev => prev.filter(d => d.id !== id))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Create account
      const signupRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name }),
      })
      const signupData = await signupRes.json()
      if (!signupRes.ok) throw new Error(signupData.error || 'Failed to create account')

      // 2. Sign in
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (!result?.ok) throw new Error('Account created but sign in failed. Please sign in manually.')

      // 3. Save health profile
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          age: parseInt(form.age) || null,
          sex: form.sex,
          conditions: form.conditions,
          goals: form.goals,
          medicalReportIds: uploadedDocs.map(d => d.id),
        }),
      })

      router.push('/dashboard')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-0 flex flex-col items-center justify-center py-10 px-4">
      {/* Background accent */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-sage-200 rounded-full opacity-30 blur-3xl -z-10" />

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-sage-400 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-medium text-neutral-600">NutriScan</span>
          </Link>
          <h1 className="text-3xl font-medium text-neutral-600">Create your account</h1>
          <p className="text-neutral-500 text-sm mt-2">Step {step} of 4</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-sage-600' : 'bg-neutral-200'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-8">

          {/* ── STEP 1: Account Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-medium text-neutral-600 mb-6">Account Details</h2>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                  placeholder="Repeat your password"
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">Passwords don't match</p>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="w-full flex items-center justify-center gap-2 bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 disabled:opacity-40 disabled:cursor-not-allowed transition mt-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Personal Info ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-medium text-neutral-600 mb-6">Personal Information</h2>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    min={1}
                    max={120}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">Gender</label>
                  <select
                    value={form.sex}
                    onChange={e => setForm({ ...form, sex: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 text-neutral-600 font-medium py-3 rounded-lg hover:bg-neutral-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!step2Valid}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Health Conditions + Goals ── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-neutral-600">Health Profile</h2>
              <p className="text-sm text-neutral-500 -mt-4">Select conditions that apply to you</p>

              <div className="space-y-3">
                {CONDITIONS.map(c => (
                  <label
                    key={c.name}
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition ${
                      form.conditions.includes(c.name)
                        ? 'border-sage-400 bg-sage-50'
                        : 'border-neutral-200 hover:border-sage-300 hover:bg-sage-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.conditions.includes(c.name)}
                      onChange={() => toggleCondition(c.name)}
                      className="mt-1 w-5 h-5 rounded text-sage-600 border-neutral-300 focus:ring-sage-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-neutral-600">
                        {c.icon} {c.name}
                      </div>
                      <div className="text-sm text-neutral-500">{c.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-600 mb-3">Health Goals</p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                        form.goals.includes(g)
                          ? 'bg-sage-600 text-white border-sage-600'
                          : 'border-neutral-200 text-neutral-600 hover:border-sage-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 text-neutral-600 font-medium py-3 rounded-lg hover:bg-neutral-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 transition"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Upload Documents ── */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-neutral-600">Health Documents</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Upload blood reports or health records. Our AI will extract relevant conditions and update your profile automatically.
                </p>
              </div>

              {/* Upload area */}
              <label className="block">
                <div className="border-2 border-dashed border-sage-200 rounded-xl p-8 text-center cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-sage-500 animate-spin" />
                      <p className="text-sage-600 font-medium">Analysing document with AI...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-sage-400 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-neutral-600 font-medium mb-1">Upload blood reports or health docs</p>
                      <p className="text-sm text-neutral-500">PDF or image files · max 10 MB each</p>
                    </>
                  )}
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

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {uploadError}
                </div>
              )}

              {/* Uploaded documents with AI analysis results */}
              {uploadedDocs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-600">
                    Uploaded Documents ({uploadedDocs.length})
                  </p>
                  {uploadedDocs.map(doc => (
                    <div key={doc.id} className="bg-sage-50 border border-sage-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-sage-600 mt-0.5 shrink-0" strokeWidth={2} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-600 truncate">{doc.fileName}</p>
                            {doc.analysisResult?.keyFindings && (
                              <p className="text-xs text-neutral-500 mt-1">{doc.analysisResult.keyFindings}</p>
                            )}
                            {doc.analysisResult?.detectedConditions?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.analysisResult.detectedConditions.map(c => (
                                  <span
                                    key={c}
                                    className="px-2 py-0.5 bg-sage-200 text-sage-700 text-xs rounded-full font-medium"
                                  >
                                    {c} detected
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.id)}
                          className="text-rose-400 hover:text-rose-600 transition shrink-0"
                        >
                          <X className="w-5 h-5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conditions auto-updated notice */}
              {form.conditions.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-sage-50 border border-sage-200 rounded-lg text-sm text-sage-700">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Profile includes: <strong>{form.conditions.join(', ')}</strong>
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 text-neutral-600 font-medium py-3 rounded-lg hover:bg-neutral-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Complete Sign Up
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-neutral-400">
                You can skip document upload and add them later from your profile
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-sage-700 font-medium hover:text-sage-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
