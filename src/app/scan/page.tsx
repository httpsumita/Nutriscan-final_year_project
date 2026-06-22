'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, ArrowLeft, Camera, Sparkles, Zap, CheckCircle, HelpCircle, Keyboard } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function ScanPage() {
  const { data: session } = useSession()
  const [scanning, setScanning] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showChatHelp, setShowChatHelp] = useState(false)
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

    setAnalyzing(true)
    
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
        // Simulate processing delay for better UX
        setTimeout(() => {
          setResult(data.product)
          setAnalyzing(false)
          
          // Initialize chat with enhanced product analysis
          const initialMessage = `🎉 **Analysis Complete!**

**${data.product.productName}**

🏆 **Compatibility Score: ${data.product.score}/10**

${data.product.score >= 8 ? '✅ **Excellent Choice!**' : 
  data.product.score >= 6 ? '🟡 **Good Option**' : 
  data.product.score >= 4 ? '🟠 **Use with Caution**' : 
  '🔴 **Not Recommended**'} for your health profile.

**Health Insights:**
${data.product.healthRecommendation}

${data.product.benefitFactors.length > 0 ? `**✅ Benefits:**\n${data.product.benefitFactors.slice(0, 3).map(f => `• ${f}`).join('\n')}\n` : ''}
${data.product.riskFactors.length > 0 ? `**⚠️ Consider:**\n${data.product.riskFactors.slice(0, 3).map(f => `• ${f}`).join('\n')}\n` : ''}

💬 Feel free to ask me anything about this product!`

          setChatMessages([
            { role: 'assistant', content: initialMessage }
          ])
        }, 2500)
      } else {
        setError(data.error || 'Failed to analyze image')
        setAnalyzing(false)
      }
    } catch (err) {
      setError('Error analyzing image: ' + String(err))
      setAnalyzing(false)
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
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all hover:shadow-md">
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600">Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-700 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                Product Scanner
              </h1>
            </div>
          </div>
        </div>

        {/* Camera View - Initial State */}
        {!scanning && !analyzing && !result && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
              {/* Hero Section */}
              <div className="bg-gradient-to-br from-sage-400 to-sage-600 px-8 py-12 text-white text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-10 h-10" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Ready to Scan</h2>
                <p className="text-sage-100 text-lg max-w-md mx-auto">
                  Point your camera at any food product to get personalized health compatibility scores
                </p>
              </div>
              
              {/* Features List */}
              <div className="px-8 py-8">
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-700">Instant AI Analysis</h3>
                      <p className="text-xs text-neutral-500">Ingredients analyzed in seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-purple-600" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-700">Personalized Scoring</h3>
                      <p className="text-xs text-neutral-500">Based on your health conditions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-600" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-700">Smart Chat Interface</h3>
                      <p className="text-xs text-neutral-500">Ask questions about your results</p>
                    </div>
                  </div>
                </div>
                
                {/* Start Button */}
                <div className="text-center">
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sage-600 to-sage-700 text-white font-medium rounded-xl hover:from-sage-700 hover:to-sage-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Camera className="w-5 h-5" strokeWidth={2} />
                    Start Scanning
                  </button>
                  <p className="text-sm text-neutral-500 mt-3">
                    📱 Make sure your product label is clearly visible
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera Capture - Recording State */}
        {scanning && (
          <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-neutral-700">Camera Active</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Position your product in the center</p>
              </div>
              
              {/* Camera Frame with Overlay */}
              <div className="relative flex-1 min-h-0">
                {/* Scan overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white border-opacity-50 rounded-lg">
                    {/* Corner guides */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sage-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sage-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sage-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sage-400"></div>
                  </div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-sage-400 to-transparent animate-pulse"></div>
                </div>
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover bg-black"
                />
              </div>
              
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="hidden"
              />
              
              {/* Control Buttons */}
              <div className="p-4 flex gap-3">
                <button
                  onClick={captureImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md"
                >
                  <Camera className="w-5 h-5" strokeWidth={2} />
                  Capture & Analyze
                </button>
                <button
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream
                    stream?.getTracks().forEach(track => track.stop())
                    setScanning(false)
                  }}
                  className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {analyzing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-12 text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-12 h-12 text-white animate-spin" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-semibold text-neutral-700 mb-3">Analyzing Product</h2>
              <p className="text-neutral-600 mb-6">
                Our AI is examining ingredients, nutrition facts, and calculating your personalized compatibility score...
              </p>
              
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-4">
                {['Scanning', 'Processing', 'Scoring'].map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      i <= 1 ? 'bg-sage-500 text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-xs text-neutral-500">{step}</span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-sage-400 to-sage-500 h-2 rounded-full animate-pulse" style={{ width: '66%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Chat Interface - Result Display */}
        {result && (
          <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-lg">
            {/* Chat Header with Product Summary */}
            <div className="bg-gradient-to-r from-sage-600 to-sage-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{result.productName}</h3>
                    <p className="text-sm text-sage-100">Ask me anything about this product!</p>
                  </div>
                </div>
                {/* Score Badge */}
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">{result.score}/10</span>
                </div>
              </div>
            </div>

            {/* Product Quick Info Bar */}
            <div className="bg-gradient-to-r from-neutral-50 to-sage-50 px-6 py-3 border-b border-neutral-200">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    result.score >= 8 ? 'bg-green-400' :
                    result.score >= 6 ? 'bg-yellow-400' :
                    result.score >= 4 ? 'bg-orange-400' : 'bg-red-400'
                  }`}></div>
                  <span className="font-medium text-neutral-600">
                    {result.score >= 8 ? 'Excellent Choice' :
                     result.score >= 6 ? 'Good Option' :
                     result.score >= 4 ? 'Use Caution' : 'Not Recommended'}
                  </span>
                </div>
                {result.ingredients && (
                  <div className="text-neutral-500">
                    {result.ingredients.length} ingredients analyzed
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages with Enhanced Styling */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-neutral-50 to-white">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Avatar with Animation */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-sage-600 to-sage-700 text-white ml-auto' 
                        : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white animate-pulse'
                    }`}>
                      {msg.role === 'user' 
                        ? session?.user?.name?.charAt(0).toUpperCase() || 'U'
                        : '🤖'
                      }
                    </div>
                    
                    {/* Enhanced Message Bubble */}
                    <div className="relative">
                      {/* Speech bubble tail */}
                      <div className={`absolute top-3 ${
                        msg.role === 'user' 
                          ? 'right-0 translate-x-2' 
                          : 'left-0 -translate-x-2'
                      }`}>
                        <div className={`w-0 h-0 ${
                          msg.role === 'user'
                            ? 'border-l-8 border-l-sage-600 border-t-8 border-b-8 border-t-transparent border-b-transparent'
                            : 'border-r-8 border-r-white border-t-8 border-b-8 border-t-transparent border-b-transparent'
                        }`}></div>
                      </div>
                      
                      {/* Message Content */}
                      <div
                        className={`px-6 py-4 rounded-2xl shadow-md border ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-sage-600 to-sage-700 text-white border-sage-700'
                            : 'bg-white border-neutral-200 text-neutral-700'
                        } ${msg.role === 'assistant' ? 'animate-fadeIn' : ''}`}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content.split('\n').map((line, i) => {
                            // Format bold text (**text**)
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return (
                                <p key={i} className={`font-bold text-base mb-2 ${
                                  msg.role === 'user' ? 'text-white' : 'text-sage-700'
                                }`}>
                                  {line.replace(/\*\*/g, '')}
                                </p>
                              )
                            }
                            
                            // Format bullet points (•)
                            if (line.startsWith('•')) {
                              return (
                                <p key={i} className="ml-4 mb-1.5 flex items-start gap-2">
                                  <span className={msg.role === 'user' ? 'text-sage-200' : 'text-sage-500'}>•</span>
                                  <span>{line.substring(1).trim()}</span>
                                </p>
                              )
                            }
                            
                            // Format headings with emojis
                            if (line.includes('🎉') || line.includes('✅') || line.includes('⚠️') || line.includes('💬')) {
                              return (
                                <p key={i} className={`font-semibold mb-2 ${
                                  msg.role === 'user' ? 'text-white' : 'text-neutral-800'
                                }`}>
                                  {line}
                                </p>
                              )
                            }
                            
                            // Regular text
                            return line ? (
                              <p key={i} className="mb-2">{line}</p>
                            ) : (
                              <br key={i} />
                            )
                          })}
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-3 ${
                          msg.role === 'user' ? 'text-sage-200' : 'text-neutral-400'
                        }`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enhanced Typing Indicator */}
              {sendingMessage && (
                <div className="flex justify-start animate-slideIn">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mb-3 shadow-md animate-pulse">
                      🤖
                    </div>
                    <div className="bg-white border border-neutral-200 px-6 py-4 rounded-2xl shadow-sm">
                      <div className="flex gap-2 items-center">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs text-neutral-500 ml-2">NutriBot is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Enhanced Quick Suggestions */}
            <div className="border-t border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-4">
              <div className="mb-3">
                <p className="text-xs font-semibold text-neutral-600 mb-2">💡 Quick Questions:</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { text: 'Is this healthy for me?', icon: '❤️' },
                    { text: 'What are the ingredients?', icon: '📋' },
                    { text: 'Any allergens?', icon: '⚠️' },
                    { text: 'Better alternatives?', icon: '🔄' },
                    { text: 'Nutrition facts?', icon: '📊' },
                    { text: 'How much can I eat?', icon: '🥄' }
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (!sendingMessage && !messageInput) {
                          setMessageInput(suggestion.text)
                          // Auto-send the suggestion
                          setTimeout(() => sendMessage(), 100)
                        }
                      }}
                      disabled={sendingMessage}
                      className="flex items-center gap-1 px-3 py-2 text-xs bg-sage-100 text-sage-700 rounded-full hover:bg-sage-200 transition-all border border-sage-200 disabled:opacity-50 hover:scale-105 transform"
                    >
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Enhanced Input Area */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (!sendingMessage) sendMessage()
                      }
                    }}
                    placeholder="Ask about ingredients, health impacts, alternatives..."
                    disabled={sendingMessage}
                    rows={messageInput.includes('\n') ? 3 : 1}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent placeholder-neutral-400 text-neutral-700 bg-white transition-all resize-none"
                  />
                  {/* Character count */}
                  <div className="absolute bottom-1 right-2 text-xs text-neutral-400">
                    {messageInput.length}/500
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageInput.trim() || messageInput.length > 500}
                  className="px-4 py-3 bg-gradient-to-r from-sage-600 to-sage-700 text-white rounded-xl hover:from-sage-700 hover:to-sage-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {sendingMessage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
              
              {/* Input Help Text */}
              <p className="text-xs text-neutral-500 mt-2 text-center">
                💬 Press Enter to send • Shift+Enter for new line • Ask about health impacts, alternatives, or nutrition
              </p>
            </div>

            {/* Enhanced Action Area */}
            <div className="border-t border-neutral-200 p-4 bg-neutral-50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResult(null)
                    setChatMessages([])
                    setMessageInput('')
                    setError('')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 rounded-lg hover:from-sage-200 hover:to-sage-300 font-medium transition-all border border-sage-300 hover:shadow-md transform hover:scale-[1.02]"
                >
                  <Camera className="w-4 h-4" strokeWidth={2} />
                  Scan Another Product
                </button>
                <Link 
                  href="/dashboard"
                  className="px-6 py-3 bg-white border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 font-medium transition-all flex items-center gap-2 hover:shadow-md"
                >
                  <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  Done
                </Link>
              </div>
              
              {/* Chat Stats */}
              <div className="flex justify-center items-center gap-6 mt-3 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <span>💬</span>
                  <span>{chatMessages.length} messages</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🤖</span>
                  <span>Powered by Gemini AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Private conversation</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              <div>
                <p className="font-medium">Analysis Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chat Help Button */}
        {result && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setShowChatHelp(!showChatHelp)}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
            >
              <HelpCircle className="w-6 h-6" strokeWidth={2} />
            </button>
            
            {/* Chat Help Tooltip */}
            {showChatHelp && (
              <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 w-64 animate-fadeIn">
                <div className="text-sm space-y-2">
                  <div className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Keyboard className="w-4 h-4" strokeWidth={2} />
                    Chat Tips
                  </div>
                  
                  <div className="space-y-2 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Send message:</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">Enter</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>New line:</span>
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">Shift + Enter</kbd>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 mt-2">
                      <p className="font-medium mb-1">Try asking:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• "Is this good for PCOS?"</li>
                        <li>• "How much sugar does it have?"</li>
                        <li>• "What are healthier alternatives?"</li>
                        <li>• "Should I avoid this ingredient?"</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Close button */}
                <button 
                  onClick={() => setShowChatHelp(false)}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
