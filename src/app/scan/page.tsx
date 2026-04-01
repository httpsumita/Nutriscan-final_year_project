'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      setError('')
      setScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Unable to access camera: ' + String(err))
      setScanning(false)
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    const imageData = canvasRef.current.toDataURL('image/jpeg')

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    setScanning(false)

    // Send to API for analysis
    try {
      setError('')
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      })

      const data = await response.json()
      if (data.ok) {
        setResult(data.product)
      } else {
        setError(data.error || 'Failed to analyze image')
      }
    } catch (err) {
      setError('Error analyzing image: ' + String(err))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto py-6 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scan Product</h2>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back
        </Link>
      </div>

      {!scanning && !result && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-slate-700 mb-6">
            Point your camera at a food product to analyze its nutritional compatibility with your health profile.
          </p>
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Open Camera
          </button>
        </div>
      )}

      {scanning && (
        <div className="space-y-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="hidden"
          />
          <div className="flex gap-3">
            <button
              onClick={captureImage}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Capture
            </button>
            <button
              onClick={() => {
                const stream = videoRef.current?.srcObject as MediaStream
                stream?.getTracks().forEach(track => track.stop())
                setScanning(false)
              }}
              className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold">{result.productName}</h3>
            <div className="mt-4">
              <p className="text-sm text-slate-600">Compatibility Score</p>
              <div className="text-4xl font-bold text-blue-600">{result.score}</div>
            </div>
          </div>

          {result.ingredients && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Ingredients</h4>
              <div className="flex flex-wrap gap-2">
                {result.ingredients.slice(0, 5).map((ing: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                    {ing}
                  </span>
                ))}
                {result.ingredients.length > 5 && (
                  <span className="px-2 py-1 text-xs text-slate-600">
                    +{result.ingredients.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-x-3">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Scan Another
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 inline-block"
            >
              Done
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      </div>
    </div>
  )
}
