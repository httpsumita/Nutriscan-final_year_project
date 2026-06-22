'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, FileText, ArrowLeft, Download, Trash2, Calendar, Shield, Plus, CheckCircle } from 'lucide-react'

interface MedicalReport {
  id: string
  fileName: string
  uploadedAt: string
  fileSize?: number
}

export default function MedicalReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPG, PNG)')
      return
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload-medical-report', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()
      
      if (data.ok) {
        setSuccess(`Successfully uploaded ${file.name}`)
        setReports(prev => [...prev, data.report])
        setTimeout(() => {
          setSuccess('')
          setUploadProgress(0)
        }, 3000)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed: ' + String(err))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-50">
      <div className="max-w-4xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-neutral-700 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              Medical Reports
            </h1>
            <p className="text-neutral-600 mt-1">Securely store and manage your health documents</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                All medical reports are encrypted and stored securely. Only you can access your documents. 
                We never share your medical information with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-sage-600 to-sage-700 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6" strokeWidth={2} />
              <h2 className="text-xl font-semibold">Upload New Report</h2>
            </div>
          </div>

          <div className="p-8">
            {!uploading ? (
              <div 
                onClick={handleFileSelect}
                className="border-2 border-dashed border-sage-300 rounded-xl p-12 text-center hover:border-sage-400 hover:bg-sage-50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-sage-200 transition-all">
                  <Upload className="w-8 h-8 text-sage-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-700 mb-3">
                  Drop your medical report here
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Upload blood test results, medical reports, or other health documents. 
                  We accept PDF, JPG, and PNG files up to 10MB.
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-all">
                  <Upload className="w-5 h-5" strokeWidth={2} />
                  Choose File
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-blue-600 animate-bounce" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-700 mb-3">Uploading...</h3>
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-neutral-200 rounded-full h-3 mb-3">
                    <div 
                      className="bg-gradient-to-r from-sage-400 to-sage-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600">{uploadProgress}% complete</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2} />
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" strokeWidth={2} />
                <h2 className="text-xl font-semibold">Your Reports</h2>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{reports.length} files</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-200">
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-neutral-400" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-medium text-neutral-600 mb-2">No reports uploaded yet</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Upload your first medical report to start building your health profile. 
                  This helps provide more personalized nutrition recommendations.
                </p>
              </div>
            ) : (
              reports.map((report, index) => (
                <div key={report.id} className="p-6 hover:bg-neutral-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-700">{report.fileName}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-neutral-500">
                            <Calendar className="w-4 h-4" strokeWidth={1.5} />
                            {formatDate(report.uploadedAt)}
                          </div>
                          <span className="text-sm text-neutral-500">
                            {formatFileSize(report.fileSize)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Download className="w-5 h-5" strokeWidth={2} />
                      </button>
                      <button className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}