'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-lg">N</div>
          <span className="text-xl font-bold">NutriScan</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/auth/signin"
            className="px-6 py-2 text-sm font-medium border border-blue-400 rounded-lg hover:bg-blue-500/10 transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AI-Powered</span> Nutrition Guide
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Stop generic calorie counting. Get personalized nutrition analysis based on your hormonal health, medical conditions, and goals.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 text-center"
              >
                Get Started Free
              </Link>
              <button className="px-8 py-4 border border-slate-400 rounded-lg font-semibold hover:bg-slate-800/50 transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">📷</div>
                  <div>
                    <p className="font-semibold text-sm">Snap & Scan</p>
                    <p className="text-xs text-slate-400">Capture any food product</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">🧠</div>
                  <div>
                    <p className="font-semibold text-sm">AI Analysis</p>
                    <p className="text-xs text-slate-400">Ingredient & nutrition extract</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center text-2xl">💯</div>
                  <div>
                    <p className="font-semibold text-sm">Smart Score</p>
                    <p className="text-xs text-slate-400">Your personalized compatibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-slate-800/40 border-t border-slate-700/50 py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-bold text-center mb-16">Why NutriScan?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Hormonal Health First', desc: 'Analysis tailored for PCOS, thyroid, insulin resistance, menopause, and more' },
              { icon: '🔬', title: 'Research-Backed', desc: 'Every recommendation backed by PubMed studies and latest nutritional science' },
              { icon: '⚡', title: 'Instant Insights', desc: 'AI-powered scoring shows exact compatibility with your health profile in seconds' },
              { icon: '📊', title: 'Track Progress', desc: 'Daily hormonal load score, weekly patterns, and personalized improvement tips' },
              { icon: '🔒', title: 'Privacy First', desc: 'Your health data stays encrypted. Medical reports never shared without consent' },
              { icon: '⏱️', title: 'Save Time', desc: 'No more reading labels. Scan, get score, log consumption in 10 seconds' }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-700/30 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: '1', title: 'Profile', desc: 'Tell us your health conditions and goals' },
            { num: '2', title: 'Scan', desc: 'Point camera at any food product label' },
            { num: '3', title: 'Analyze', desc: 'AI extracts ingredients and nutrition data' },
            { num: '4', title: 'Score', desc: 'Get personalized 0–100 compatibility score' }
          ].map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl max-w-3xl mx-auto px-8 py-16 text-center mb-20">
        <h2 className="text-4xl font-bold mb-4">Ready to transform your nutrition?</h2>
        <p className="text-xl text-slate-300 mb-8">Join thousands who are making smarter food choices based on their hormonal health.</p>
        <Link
          href="/auth/signin"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
        >
          Start Your Journey
        </Link>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 py-8 text-center text-slate-400 text-sm">
        <p>NutriScan © 2026 | Personalized Nutrition Intelligence</p>
      </footer>
    </div>
  )
}
