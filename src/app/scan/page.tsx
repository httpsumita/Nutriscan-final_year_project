'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, ArrowLeft } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function ScanPage() {
  const { data: session } = useSession()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [showCaloriePopup, setShowCaloriePopup] = useState(false)
  const [calorieInput, setCalorieInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Other')
  const [addingCalorie, setAddingCalorie] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const startCamera = async () => {
    try {
      setError('')
      
      // Check if running on client side
      if (typeof window === 'undefined') {
        setError('Camera access is only available in the browser.')
        setScanning(false)
        return
      }

      // Check if browser supports getUserMedia
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.')
        setScanning(false)
        return
      }

      // Check if running on localhost, HTTPS, or 127.0.0.1
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (!isSecure) {
        setError('Camera access requires HTTPS or localhost. Please access over a secure connection.')
        setScanning(false)
        return
      }

      setScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setScanning(false)
      const errorMessage = err instanceof Error ? err.message : String(err)
      
      if (errorMessage.includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access and try again.')
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera device found. Please check your device.')
      } else if (errorMessage.includes('NotReadableError')) {
        setError('Camera is in use by another application. Please close other apps and try again.')
      } else {
        setError('Unable to access camera: ' + errorMessage)
      }
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    const imageData = canvasRef.current.toDataURL('image/jpeg')
    setCapturedImage(imageData)

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    setScanning(false)
    setAnalyzing(true)

    // Send to API for analysis
    try {
      setError('')
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      })

      const data = await response.json()
      setAnalyzing(false)
      setCapturedImage('')
      
      if (data.ok) {
        setResult(data.product)
        // Initialize chat with product analysis - simplified to final recommendation only
        const finalScore = data.product.ragContext.combinedScore || data.product.score
        const finalRec = data.product.ragContext.finalRecommendation || data.product.healthRecommendation
        
        const initialMessage = `I found a product: **${data.product.productName}**

📊 **Final Score: ${finalScore}/10**

${finalScore >= 7 ? '✅ RECOMMENDED' : finalScore >= 5 ? '⚠️ CAUTION' : '❌ NOT RECOMMENDED'} for your health profile.

**Why:** ${finalRec}

What would you like to know about this product?`

        setChatMessages([
          { role: 'assistant', content: initialMessage }
        ])
      } else {
        setError(data.error || 'Failed to analyze image')
      }
    } catch (err) {
      setAnalyzing(false)
      setCapturedImage('')
      setError('Error analyzing image: ' + String(err))
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !result) return

    // Add user message to chat
    const userMessage = messageInput
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setMessageInput('')
    setSendingMessage(true)

    try {
      const response = await fetch('/api/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: result.productName,
          ingredients: result.ingredients,
          score: result.score,
          scoreRange: result.scoreRange,
          question: userMessage,
          scanId: result.scanId
        })
      })

      const data = await response.json()
      if (data.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: Unable to get response.' }])
    } finally {
      setSendingMessage(false)
    }
  }

  const handleAddCalorie = async () => {
    if (!calorieInput || !result) return

    setAddingCalorie(true)
    try {
      const response = await fetch('/api/log-calorie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: result.productName,
          category: categoryInput,
          calories: parseInt(calorieInput)
        })
      })

      const data = await response.json()
      if (data.ok) {
        setShowCaloriePopup(false)
        setCalorieInput('')
        setCategoryInput('Other')
        setResult(null)
        setChatMessages([])
        // Trigger dashboard refresh
        window.dispatchEvent(new Event('calorieAdded'))
      }
    } catch (err) {
      console.error('Failed to add calorie:', err)
    } finally {
      setAddingCalorie(false)
    }
  }

  const handleSkipCalorie = () => {
    setShowCaloriePopup(false)
    setCalorieInput('')
    setCategoryInput('Other')
    setResult(null)
    setChatMessages([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-0">
      <div className="max-w-2xl mx-auto py-6 px-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-600">Scan Product</h2>
          <Link href="/dashboard" className="flex items-center gap-1 text-sage-600 hover:text-sage-700 transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </div>

        {/* Camera View - Initial State */}
        {!scanning && !result && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-gradient-to-br from-sage-100 to-sage-50 border border-sage-200 rounded-lg p-12 text-center">
              <div className="text-6xl mb-6">📷</div>
              <p className="text-neutral-600 mb-8 text-lg leading-relaxed">
                Point your camera at a food product to analyze its nutritional compatibility with your health profile.
              </p>
              <button
                onClick={startCamera}
                className="px-8 py-4 bg-sage-700 text-white font-medium rounded-lg hover:bg-sage-800 transition inline-block"
              >
                Open Camera
              </button>
            </div>
          </div>
        )}

        {/* Camera Capture - Recording State */}
        {scanning && (
          <div className="flex-1 flex flex-col gap-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black flex-1 object-cover"
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
                className="flex-1 px-4 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 font-medium transition"
              >
                Capture
              </button>
              <button
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream
                    stream.getTracks().forEach(track => track.stop())
                  }
                  setScanning(false)
                }}
                className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Analyzing State - Image with Overlay */}
        {analyzing && capturedImage && (
          <div className="flex-1 relative">
            <img
              src={capturedImage}
              alt="Captured product"
              className="w-full h-full rounded-lg object-cover"
            />
            {/* Analyzing Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center z-10">
              <div className="bg-white/95 rounded-xl px-8 py-6 text-center backdrop-blur">
                <div className="mb-4">
                  <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Product</h3>
                <p className="text-sm text-neutral-600">Extracting ingredients and nutrition info...</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface - Result Display */}
        {result && (
          <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-sage-600 text-white rounded-br-none'
                        : 'bg-neutral-100 text-neutral-600 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 text-neutral-600 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-neutral-200 p-4 bg-neutral-50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
                  placeholder="Ask about this product..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent placeholder-neutral-400 text-neutral-600"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageInput.trim()}
                  className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* New Scan Button */}
            <div className="border-t border-neutral-200 p-4">
              <button
                onClick={() => setShowCaloriePopup(true)}
                className="w-full px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 font-medium transition text-sm"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Calorie Popup Modal */}
      {showCaloriePopup && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">Add to Calorie Intake?</h3>
            <p className="text-neutral-600 text-sm mb-6">
              Would you like to add <span className="font-medium">{result?.productName}</span> to your daily calorie tracker?
            </p>

            {/* Calorie Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Calories (estimated)
              </label>
              <input
                type="number"
                value={calorieInput}
                onChange={(e) => setCalorieInput(e.target.value)}
                placeholder="Enter calorie count"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 placeholder-neutral-400"
              />
            </div>

            {/* Category Select */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Category
              </label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-neutral-600 bg-white"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Beverage">Beverage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkipCalorie}
                disabled={addingCalorie}
                className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 font-medium transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No
              </button>
              <button
                onClick={handleAddCalorie}
                disabled={addingCalorie || !calorieInput}
                className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 font-medium transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingCalorie ? 'Adding...' : 'Yes, Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
