'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Send, ArrowLeft, MessageCircle, Sparkles, Zap, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Coffee, Activity, Apple, Moon, Dumbbell, Book, Trash2 } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  id: string
  copied?: boolean
  liked?: boolean
  disliked?: boolean
}

export default function HealthChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Show scroll to bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
      }
    }

    const container = chatContainerRef.current
    container?.addEventListener('scroll', handleScroll)
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  // Initialize chat with welcome message
  useEffect(() => {
    if (session?.user && !conversationStarted) {
      const welcomeMessage = `Hi ${session.user.name?.split(' ')[0] || 'there'}! 👋

I'm your AI nutrition advisor, here to help you make healthier choices.

**I can help you with:**
• Nutrition and meal planning advice
• Health condition guidance
• Understanding food labels and ingredients
• Personalized recommendations based on your goals
• General wellness tips

What would you like to know today?`

      setChatMessages([
        { 
          role: 'assistant', 
          content: welcomeMessage, 
          timestamp: new Date(),
          id: 'welcome-' + Date.now()
        }
      ])
      setConversationStarted(true)
    }
  }, [session, conversationStarted])

  const sendMessage = async () => {
    if (!messageInput.trim()) return

    const userMessage = messageInput
    const timestamp = new Date()
    const messageId = 'msg-' + Date.now()
    
    setChatMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage, 
      timestamp,
      id: messageId + '-user'
    }])
    setMessageInput('')
    setSendingMessage(true)

    try {
      const response = await fetch('/api/general-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conditions: session?.user?.conditions || [],
          goals: session?.user?.goals || [],
          chatHistory: chatMessages.slice(-5)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response || "I'm here to help with your health questions! Could you be more specific about what you'd like to know?",
          timestamp: new Date(),
          id: messageId + '-assistant'
        }])
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm having trouble processing that right now. Could you try rephrasing your question?",
          timestamp: new Date(),
          id: messageId + '-assistant-error'
        }])
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm experiencing some technical difficulties. Please try again in a moment!",
        timestamp: new Date(),
        id: messageId + '-assistant-error'
      }])
    } finally {
      setSendingMessage(false)
    }
  }

  const copyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content)
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, copied: true } : msg
    ))
    setTimeout(() => {
      setChatMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, copied: false } : msg
      ))
    }, 2000)
  }

  const likeMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, liked: !msg.liked, disliked: false } : msg
    ))
  }

  const dislikeMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, disliked: !msg.disliked, liked: false } : msg
    ))
  }

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setChatMessages([])
      setConversationStarted(false)
    }
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const regenerateResponse = async () => {
    if (chatMessages.length < 2) return
    
    const lastUserMessage = [...chatMessages].reverse().find(msg => msg.role === 'user')
    if (!lastUserMessage) return

    // Remove last assistant response
    setChatMessages(prev => prev.filter(msg => msg.role === 'user' || msg.id !== prev[prev.length - 1].id))
    setMessageInput(lastUserMessage.content)
    setTimeout(() => sendMessage(), 100)
  }

  const quickQuestions = [
    { 
      icon: Coffee, 
      text: 'What should I eat for breakfast?', 
      category: 'nutrition',
      color: 'from-amber-400 to-orange-500'
    },
    { 
      icon: Activity, 
      text: 'Help with my PCOS symptoms', 
      category: 'health',
      color: 'from-rose-400 to-pink-500'
    },
    { 
      icon: Dumbbell, 
      text: 'Exercise recommendations for me', 
      category: 'fitness',
      color: 'from-blue-400 to-cyan-500'
    },
    { 
      icon: Moon, 
      text: 'Tips for better sleep', 
      category: 'lifestyle',
      color: 'from-indigo-400 to-purple-500'
    },
    { 
      icon: Zap, 
      text: 'Explain my health metrics', 
      category: 'data',
      color: 'from-green-400 to-emerald-500'
    },
    { 
      icon: Apple, 
      text: 'Plan a healthy meal', 
      category: 'planning',
      color: 'from-sage-400 to-teal-500'
    }
  ]

  const handleQuickQuestion = (question: string) => {
    setMessageInput(question)
    setConversationStarted(true)
    setTimeout(() => {
      sendMessage()
      inputRef.current?.focus()
    }, 100)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-neutral-0">
        <div className="text-center">
          <div className="inline-block w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-sage-700 rounded-full animate-spin" />
          </div>
          <p className="text-neutral-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-neutral-50 to-blue-50">
      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Enhanced Header with Gradient */}
        <div className="bg-gradient-to-r from-sage-600 via-sage-500 to-teal-500 shadow-xl relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="px-6 py-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 rounded-xl transition-all text-white border border-white border-opacity-30 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm font-semibold">Back</span>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white border-opacity-30 relative">
                    <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                      Health Chat
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" strokeWidth={2.5} />
                    </h1>
                    <p className="text-sm text-white text-opacity-90">AI-Powered Nutrition Advisor</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Clear Chat Button */}
                {chatMessages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 rounded-xl transition-all text-white border border-white border-opacity-30"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-medium">Clear</span>
                  </button>
                )}
                
                {/* Status Indicator */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl border border-white border-opacity-30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Question Suggestions */}
        {!conversationStarted && (
          <div className="p-6 bg-gradient-to-br from-white via-sage-50 to-blue-50 border-b border-neutral-200 shadow-sm animate-fadeIn">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-sage-600" strokeWidth={2.5} />
                <h2 className="text-lg font-bold text-neutral-800">Quick Start</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-sage-200 to-transparent"></div>
              </div>
              <p className="text-sm text-neutral-600 mb-5">Choose a topic or type your own question below</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickQuestions.map((q, i) => {
                  const IconComponent = q.icon
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q.text)}
                      className="group relative overflow-hidden flex items-center gap-3 p-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-transparent hover:shadow-xl transition-all text-left transform hover:-translate-y-1"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${q.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                      
                      <div className={`relative w-11 h-11 bg-gradient-to-br ${q.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="relative text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 flex-1">
                        {q.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#a8d4cb #f5f5f0'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {chatMessages.length === 0 && (
              <div className="text-center py-20 animate-fadeIn">
                <div className="w-20 h-20 bg-gradient-to-br from-sage-200 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <MessageCircle className="w-10 h-10 text-sage-600" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-700 mb-2">Start a Conversation</h3>
                <p className="text-neutral-500">Ask me anything about nutrition and health!</p>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn group`}>
                <div className={`max-w-3xl ${msg.role === 'user' ? '' : 'w-full'}`}>
                  {/* Avatar and Name Row */}
                  <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-teal-500 flex items-center justify-center shadow-md ring-2 ring-white">
                        <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                    <span className="text-xs font-bold text-neutral-600">
                      {msg.role === 'user' ? (session?.user?.name?.split(' ')[0] || 'You') : 'NutriBot AI'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-white">
                        <span className="text-white text-sm font-bold">
                          {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="relative">
                    <div
                      className={`px-5 py-4 rounded-2xl shadow-md ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ml-auto'
                          : 'bg-white border-2 border-neutral-100 text-neutral-800 hover:border-sage-200 transition-colors'
                      }`}
                    >
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' ? 'font-medium' : ''
                      }`}>
                        {msg.content.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={i} className="font-bold mt-3 mb-2 text-sage-700">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            )
                          }
                          if (line.startsWith('•')) {
                            return (
                              <p key={i} className="ml-4 mb-1 flex items-start gap-2">
                                <span className="text-sage-500 font-bold mt-1">•</span>
                                <span>{line.substring(1).trim()}</span>
                              </p>
                            )
                          }
                          return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />
                        })}
                      </div>
                    </div>

                    {/* Message Actions (for assistant messages) */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-600 transition-all"
                        >
                          {msg.copied ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" strokeWidth={2.5} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => likeMessage(msg.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            msg.liked 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" strokeWidth={2.5} fill={msg.liked ? 'currentColor' : 'none'} />
                        </button>
                        
                        <button
                          onClick={() => dislikeMessage(msg.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            msg.disliked 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" strokeWidth={2.5} fill={msg.disliked ? 'currentColor' : 'none'} />
                        </button>

                        {idx === chatMessages.length - 1 && (
                          <button
                            onClick={regenerateResponse}
                            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-600 transition-all"
                          >
                            <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                            <span>Regenerate</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {sendingMessage && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-teal-500 flex items-center justify-center shadow-md ring-2 ring-white">
                      <Sparkles className="w-4 h-4 text-white animate-spin" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-neutral-600">NutriBot AI</span>
                    <span className="text-xs text-sage-500 font-medium animate-pulse">is thinking...</span>
                  </div>
                  <div className="bg-white border-2 border-neutral-100 px-6 py-4 rounded-2xl shadow-md">
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-sage-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-32 right-8 w-12 h-12 bg-gradient-to-br from-sage-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 animate-fadeIn z-10"
            >
              <ArrowLeft className="w-5 h-5 rotate-[-90deg]" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="bg-white border-t-2 border-neutral-200 shadow-2xl">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Character count & Tips */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-neutral-500 flex items-center gap-2">
                  <Book className="w-3 h-3" />
                  <span>Press <kbd className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-600 font-mono text-xs">Enter</kbd> to send</span>
                  <span className="text-neutral-300">•</span>
                  <span><kbd className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-600 font-mono text-xs">Shift+Enter</kbd> for new line</span>
                </p>
                <span className={`text-xs font-bold ${
                  messageInput.length > 900 ? 'text-rose-500' : 
                  messageInput.length > 700 ? 'text-orange-500' : 
                  'text-neutral-400'
                }`}>
                  {messageInput.length}/1000
                </span>
              </div>
              
              {/* Input Box */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (!sendingMessage && messageInput.trim()) sendMessage()
                      }
                    }}
                    placeholder="Ask me anything about nutrition, health, meal planning..."
                    disabled={sendingMessage}
                    rows={messageInput.includes('\n') ? 3 : 1}
                    maxLength={1000}
                    className="w-full px-5 py-4 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent placeholder-neutral-400 text-neutral-700 bg-white transition-all resize-none font-medium shadow-sm hover:border-sage-300"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageInput.trim() || messageInput.length > 1000}
                  className="px-6 py-4 bg-gradient-to-r from-sage-600 to-teal-600 text-white rounded-xl hover:from-sage-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-bold hover:scale-105 active:scale-95"
                >
                  {sendingMessage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" strokeWidth={2.5} />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        kbd {
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  )
}
