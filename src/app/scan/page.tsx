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
        // Initialize chat with product analysis
        const initialMessage = `I found a product: **${data.product.productName}**

📊 **Compatibility Score: ${data.product.score}/10**

${data.product.shouldConsume ? '✅ Recommended' : '⚠️ Use with caution'} for your health profile.

**Key Info:**
- ${data.product.healthRecommendation}
${data.product.benefitFactors.length > 0 ? `\n**Benefits:** ${data.product.benefitFactors.slice(0, 2).join(', ')}` : ''}
${data.product.riskFactors.length > 0 ? `\n**Considerations:** ${data.product.riskFactors.slice(0, 2).join(', ')}` : ''}

What would you like to know about this product?`

        setChatMessages([
          { role: 'assistant', content: initialMessage }
        ])
      } else {
        setError(data.error || 'Failed to analyze image')
      }
    } catch (err) {
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
          question: userMessage,
          conditions: session?.user?.conditions || [],
          goals: session?.user?.goals || []
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
                  const stream = videoRef.current?.srcObject as MediaStream
                  stream?.getTracks().forEach(track => track.stop())
                  setScanning(false)
                }}
                className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300 font-medium transition"
              >
                Cancel
              </button>
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
                onClick={() => {
                  setResult(null)
                  setChatMessages([])
                  setMessageInput('')
                  setError('')
                }}
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
    </div>
  )
}
