'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Heart, Zap, TrendingUp, Lock, Leaf, Clock } from 'lucide-react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen bg-neutral-0">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-400 rounded-lg flex items-center justify-center font-bold text-white">N</div>
            <span className="text-xl font-medium text-neutral-600">NutriScan</span>
          </div>
          <div className="hidden md:flex gap-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="#features" className="text-neutral-600 hover:text-sage-700 transition text-sm font-medium">Features</a>
            <a href="#how" className="text-neutral-600 hover:text-sage-700 transition text-sm font-medium">How it Works</a>
            <a href="#" className="text-neutral-600 hover:text-sage-700 transition text-sm font-medium">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="px-5 py-2 border border-sage-400 text-sage-700 rounded-lg text-sm font-medium hover:bg-sage-50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 bg-sage-400 text-white rounded-lg text-sm font-medium hover:bg-sage-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-sage-200 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-medium leading-tight text-neutral-600 mb-6">
                Nutrition that honors your hormonal health
              </h1>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed opacity-90">
                Scan any food product. Get AI-powered compatibility scores based on your specific health conditions, not generic calorie counts.
              </p>
              <div className="flex gap-4 flex-col sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 bg-sage-700 text-white rounded-lg font-medium hover:bg-sage-800 transition text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-8 py-3 bg-white text-sage-700 border border-sage-400 rounded-lg font-medium hover:bg-sage-50 transition text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
            
            {/* Minimal SVG Cycle Ring */}
            <div className="flex items-center justify-center">
              <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-lg">
                {/* Outer circle background */}
                <circle cx="140" cy="140" r="130" fill="none" stroke="#D4EBE5" strokeWidth="2" opacity="0.3" />
                
                {/* Phase segments */}
                <circle cx="140" cy="140" r="100" fill="none" stroke="#4A7C6F" strokeWidth="8" strokeDasharray="94.2 376.8" strokeLinecap="round" />
                <circle cx="140" cy="140" r="100" fill="none" stroke="#7BAE9F" strokeWidth="8" strokeDasharray="94.2 376.8" strokeLinecap="round" strokeDashoffset="-94.2" opacity="0.6" />
                <circle cx="140" cy="140" r="100" fill="none" stroke="#D4EBE5" strokeWidth="8" strokeDasharray="94.2 376.8" strokeLinecap="round" strokeDashoffset="-188.4" opacity="0.4" />
                
                {/* Center */}
                <circle cx="140" cy="140" r="40" fill="#D4EBE5" />
                <text x="140" y="145" textAnchor="middle" className="text-sm font-medium fill-sage-700">Day 12</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-medium text-neutral-600 text-center mb-16">Why NutriScan?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Hormonal Health First', desc: 'Analysis built for PCOS, thyroid, insulin resistance, menopause, and diabetes' },
              { icon: TrendingUp, title: 'Research-Backed Insights', desc: 'Every score powered by latest nutritional science and medical research' },
              { icon: Zap, title: 'Instant Compatibility Scores', desc: 'AI analyzes ingredients in seconds, showing exact fit for your profile' },
              { icon: Clock, title: 'Save Time & Energy', desc: 'No more label reading. Scan, score, and log — done in 10 seconds' },
              { icon: Leaf, title: 'Natural & Clean', desc: 'Beautiful, calm interface designed to reduce decision fatigue' },
              { icon: Lock, title: 'Privacy Protected', desc: 'Your medical data stays encrypted and never leaves your control' }
            ].map((item, i) => {
              const IconComponent = item.icon
              return (
                <div key={i} className="bg-white border border-neutral-200 rounded-lg p-8 hover:border-sage-300 transition">
                  <IconComponent className="w-8 h-8 text-sage-700 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium text-neutral-600 mb-3">{item.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed opacity-80">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="bg-neutral-0 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-medium text-neutral-600 text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Profile', desc: 'Share your health conditions and goals' },
              { step: '02', title: 'Scan', desc: 'Point your camera at any food product' },
              { step: '03', title: 'Analyze', desc: 'AI extracts ingredients and nutrition facts' },
              { step: '04', title: 'Score', desc: 'Get your personalized compatibility score' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-8 text-center">
                  <div className="text-3xl font-medium text-sage-700 mb-3">{item.step}</div>
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm opacity-75">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sage-200 py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl font-medium text-neutral-600 mb-4">Ready to make smarter choices?</h2>
          <p className="text-neutral-600 text-lg mb-8 opacity-90">Join thousands who are transforming their nutrition based on their hormonal health.</p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-sage-700 text-white rounded-lg font-medium hover:bg-sage-800 transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-sm opacity-80">
          <p>NutriScan © 2026 | Personalized Nutrition Intelligence for Hormonal Health</p>
        </div>
      </footer>
    </div>
  )
}
