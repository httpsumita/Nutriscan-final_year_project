'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, ArrowLeft, MessageCircle, Sparkles, Zap, Heart, Target, Calendar, User, Bot } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function HealthChatPage() {
  const { data: session } = useSession()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Initialize chat with welcome message
  useEffect(() => {
    if (session?.user && !conversationStarted) {
      const welcomeMessage = `👋 Hi ${session.user.name?.split(' ')[0] || 'there'}! I'm your personal nutrition advisor.

I can help you with:
🍎 General nutrition questions
🏥 Health condition guidance  
🥗 Meal planning suggestions
💡 Lifestyle tips
📊 Understanding your health data

What would you like to discuss today?`

      setChatMessages([
        { role: 'assistant', content: welcomeMessage, timestamp: new Date() }
      ])
      setConversationStarted(true)
    }
  }, [session, conversationStarted])

  const sendMessage = async () => {
    if (!messageInput.trim()) return

    const userMessage = messageInput
    const timestamp = new Date()
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp }])
    setMessageInput('')
    setSendingMessage(true)

    try {
      // For now, simulate AI response (you can connect to your Gemini API)
      const response = await fetch('/api/general-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conditions: session?.user?.conditions || [],
          goals: session?.user?.goals || [],
          chatHistory: chatMessages.slice(-5) // Send last 5 messages for context
        })
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response || "I'm here to help with your health questions! Could you be more specific about what you'd like to know?",
          timestamp: new Date()
        }])
      } else {
        // Fallback response if API fails
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm having trouble processing that right now. Could you try rephrasing your question?",
          timestamp: new Date()
        }])
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm experiencing some technical difficulties. Please try again in a moment!",
        timestamp: new Date()
      }])
    } finally {
      setSendingMessage(false)
    }
  }

  const quickQuestions = [
    { icon: '🍎', text: 'What should I eat for breakfast?', category: 'nutrition' },
    { icon: '💊', text: 'Help with my PCOS symptoms', category: 'health' },
    { icon: '🏃‍♀️', text: 'Exercise recommendations for me', category: 'fitness' },
    { icon: '😴', text: 'Tips for better sleep', category: 'lifestyle' },
    { icon: '📊', text: 'Explain my health metrics', category: 'data' },
    { icon: '🥗', text: 'Plan a healthy meal', category: 'planning' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-neutral-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-500 to-sage-600 rounded-lg flex items-center justify-center shadow-md">
                <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800">Health Chat</h1>
                <p className="text-sm text-neutral-500">Your personal nutrition advisor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Question Cards */}
        {!conversationStarted && (
          <div className="p-6 bg-gradient-to-br from-sage-50 to-neutral-50 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Get started with a question</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessageInput(q.text)
                    setTimeout(() => sendMessage(), 100)
                  }}
                  className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-sage-300 hover:bg-sage-50 transition-all text-left group shadow-sm hover:shadow-md"
                >
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-sage-700">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Avatar and Name */}
                <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {msg.role === 'user' 
                      ? <User className="w-4 h-4" strokeWidth={2} />
                      : <Bot className="w-4 h-4" strokeWidth={2} />
                    }
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    {msg.role === 'user' ? (session?.user?.name?.split(' ')[0] || 'You') : 'NutriBot'}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-sage-600 text-white'
                      : 'bg-white border border-neutral-200 text-neutral-700'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {sendingMessage && (
            <div className="flex justify-start animate-slideIn">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">NutriBot</span>
                  <span className="text-xs text-neutral-400">thinking...</span>
                </div>
                <div className="bg-white border border-neutral-200 px-6 py-4 rounded-2xl shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-neutral-500 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-neutral-200 p-6">
          {/* Input */}
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
                placeholder="Ask about nutrition, health tips, meal planning, or your conditions..."
                disabled={sendingMessage}
                rows={messageInput.includes('\n') ? 3 : 1}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent placeholder-neutral-400 text-neutral-700 bg-white transition-all resize-none"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={sendingMessage || !messageInput.trim() || messageInput.length > 1000}
              className="px-6 py-3 bg-gradient-to-r from-sage-600 to-sage-700 text-white rounded-xl hover:from-sage-700 hover:to-sage-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {sendingMessage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" strokeWidth={2} />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          
          <p className="text-xs text-neutral-500 mt-3 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}