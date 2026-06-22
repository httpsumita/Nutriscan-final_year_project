'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Heart, Zap, TrendingUp, Lock, Leaf, Clock, ChevronDown, Play, Star, Users, Trophy, ArrowRight, Sparkles, Shield, Target, Brain } from 'lucide-react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 via-white to-neutral-50">
      {/* Enhanced Sticky Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                N
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-sage-700 to-sage-500 bg-clip-text text-transparent">
              NutriScan
            </span>
          </div>
          
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-neutral-600 hover:text-sage-700 transition-all duration-200 text-sm font-medium hover:scale-105">Features</a>
            <a href="#how" className="text-neutral-600 hover:text-sage-700 transition-all duration-200 text-sm font-medium hover:scale-105">How it Works</a>
            <a href="#" className="text-neutral-600 hover:text-sage-700 transition-all duration-200 text-sm font-medium hover:scale-105">About</a>
            <a href="#" className="text-neutral-600 hover:text-sage-700 transition-all duration-200 text-sm font-medium hover:scale-105">Support</a>
          </div>
<<<<<<< HEAD
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
=======
          
          <Link
            href="/auth/signin"
            className="group px-6 py-2.5 bg-gradient-to-r from-sage-400 to-sage-600 text-white rounded-xl text-sm font-semibold hover:from-sage-500 hover:to-sage-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
        </div>
      </nav>

      {/* Enhanced Hero Section with Animations */}
      <section className="relative bg-gradient-to-br from-sage-100 via-sage-50 to-white pt-24 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-sage-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-sage-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fadeIn">
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-sage-200 rounded-full px-4 py-2 text-sm font-medium text-sage-700 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Trusted by 50,000+ users worldwide
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 bg-sage-400 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-emerald-400 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-sage-600 rounded-full border-2 border-white"></div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-sage-700 via-sage-600 to-emerald-600 bg-clip-text text-transparent">
                  Nutrition that
                </span>
                <br />
                <span className="text-neutral-800">
                  honors your
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-sage-500 bg-clip-text text-transparent">
                  hormonal health
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 leading-relaxed max-w-lg">
                Scan any food product and get AI-powered compatibility scores based on your specific health conditions. 
                <strong className="text-sage-700"> Not generic calorie counts.</strong>
              </p>


              
              <div className="flex gap-4 flex-col sm:flex-row pt-4">
                <Link
<<<<<<< HEAD
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
=======
                  href="/auth/signin"
                  className="group px-8 py-4 bg-gradient-to-r from-sage-600 to-sage-700 text-white rounded-xl font-semibold hover:from-sage-700 hover:to-sage-800 transition-all duration-300 text-center shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
                </Link>
              </div>


            </div>
            
            {/* Enhanced Visual with 3D Effect */}
            <div className="relative flex items-center justify-center animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                {/* 3D Phone Mockup */}
                <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[3rem] p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner">
                    <div className="aspect-[9/19] w-80">
                      {/* Phone Screen Content */}
                      <div className="bg-gradient-to-br from-sage-50 to-white h-full p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-sage-400 rounded-lg flex items-center justify-center text-white text-sm font-bold">N</div>
                            <span className="font-semibold text-neutral-700">NutriScan</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-sage-400 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Scanning Interface */}
                        <div className="flex-1 bg-neutral-100 rounded-2xl p-4 mb-6">
                          <div className="aspect-square bg-gradient-to-br from-sage-200 to-sage-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-4 border-2 border-sage-400 rounded-lg animate-pulse"></div>
                            <div className="text-sage-600 font-medium">Product Scan</div>
                          </div>
                        </div>
                        
                        {/* Results */}
                        <div className="space-y-3">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-emerald-700">Compatibility</span>
                              <span className="text-2xl font-bold text-emerald-600">92%</span>
                            </div>
                            <div className="w-full bg-emerald-100 rounded-full h-2 mt-2">
                              <div className="bg-emerald-500 h-2 rounded-full w-[92%]"></div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <div className="flex-1 bg-sage-50 border border-sage-200 rounded-lg p-3 text-center">
                              <div className="text-xs text-sage-600">Hormonal</div>
                              <div className="text-sm font-bold text-sage-700">✓ Good</div>
                            </div>
                            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                              <div className="text-xs text-blue-600">Insulin</div>
                              <div className="text-sm font-bold text-blue-700">✓ Safe</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg animate-bounce" style={{animationDelay: '2s'}}>
                  <Shield className="w-6 h-6 text-sage-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-sage-600" />
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="relative bg-white py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sage-25 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-sage-100 rounded-full px-6 py-3 text-sage-700 font-medium mb-6">
              <Target className="w-5 h-5" />
              Why Choose NutriScan?
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-neutral-800 mb-6">
              Built for your <span className="bg-gradient-to-r from-sage-600 to-emerald-600 bg-clip-text text-transparent">unique biology</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Unlike generic nutrition apps, NutriScan understands that your hormonal health affects how your body processes every nutrient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Heart, 
                title: 'Hormonal Health First', 
                desc: 'Analysis built for PCOS, thyroid, insulin resistance, menopause, and diabetes',
                color: 'from-red-500 to-pink-500',
                bgColor: 'from-red-50 to-pink-50'
              },
              { 
                icon: Brain, 
                title: 'Research-Backed Insights', 
                desc: 'Every score powered by latest nutritional science and medical research',
                color: 'from-purple-500 to-indigo-500',
                bgColor: 'from-purple-50 to-indigo-50'
              },
              { 
                icon: Zap, 
                title: 'Instant Compatibility Scores', 
                desc: 'AI analyzes ingredients in seconds, showing exact fit for your profile',
                color: 'from-amber-500 to-orange-500',
                bgColor: 'from-amber-50 to-orange-50'
              },
              { 
                icon: Clock, 
                title: 'Save Time & Energy', 
                desc: 'No more label reading. Scan, score, and log — done in 10 seconds',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-50'
              },
              { 
                icon: Leaf, 
                title: 'Natural & Clean', 
                desc: 'Beautiful, calm interface designed to reduce decision fatigue',
                color: 'from-emerald-500 to-teal-500',
                bgColor: 'from-emerald-50 to-teal-50'
              },
              { 
                icon: Shield, 
                title: 'Privacy Protected', 
                desc: 'Your medical data stays encrypted and never leaves your control',
                color: 'from-slate-600 to-slate-700',
                bgColor: 'from-slate-50 to-neutral-50'
              }
            ].map((item, i) => {
              const IconComponent = item.icon
              return (
                <div 
                  key={i} 
                  className="group relative bg-white border border-neutral-200 rounded-2xl p-8 hover:border-sage-300 transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl cursor-pointer overflow-hidden"
                  onClick={() => {
                    const card = document.getElementById(`feature-card-${i}`)
                    if (card) {
                      card.classList.add('animate-pulse')
                      setTimeout(() => card.classList.remove('animate-pulse'), 600)
                    }
                  }}
                  id={`feature-card-${i}`}
                >
                  {/* Dynamic Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl`}></div>
                  
                  {/* Floating Orb Effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sage-200 to-sage-300 opacity-0 group-hover:opacity-20 rounded-full blur-2xl transition-all duration-700 transform translate-x-16 -translate-y-16 group-hover:scale-150"></div>
                  
                  <div className="relative z-10">
                    {/* Enhanced Icon with Dynamic Colors */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                      <IconComponent className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                    </div>
                    
                    {/* Enhanced Content */}
                    <h3 className="text-2xl font-bold text-neutral-800 mb-4 group-hover:text-sage-700 transition-colors duration-300">{item.title}</h3>
                    <p className="text-neutral-600 leading-relaxed mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
                    
                    {/* Interactive CTA with Animation */}
                    <div className="flex items-center text-sage-600 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-400 font-medium">
                      <span>Explore feature</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Enhanced Click Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sage-400 to-sage-600 opacity-0 group-active:opacity-10 transition-opacity duration-150 rounded-2xl"></div>
                  
                  {/* Corner Accent */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-sage-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-tl-2xl"></div>
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sage-600 to-sage-700 text-white rounded-xl font-semibold hover:from-sage-700 hover:to-sage-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Try All Features Free
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

<<<<<<< HEAD
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
=======
      {/* Enhanced How It Works Section */}
      <section id="how" className="relative bg-gradient-to-b from-neutral-50 to-white py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-r from-sage-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r from-emerald-200 to-sage-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-6 py-3 text-emerald-700 font-medium mb-6">
              <Zap className="w-5 h-5" />
              Simple 4-Step Process
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-neutral-800 mb-6">
              From scan to <span className="bg-gradient-to-r from-emerald-600 to-sage-600 bg-clip-text text-transparent">smart choice</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Our AI analyzes thousands of data points in seconds to give you personalized nutrition insights that actually matter for your health.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sage-200 via-sage-400 to-sage-200 transform -translate-y-1/2 z-0"></div>
            
            {[
              { 
                step: '01', 
                title: 'Create Profile', 
                desc: 'Share your health conditions, goals, and dietary preferences in 2 minutes',
                icon: Users,
                color: 'from-purple-500 to-indigo-500',
                delay: '0s'
              },
              { 
                step: '02', 
                title: 'Scan Product', 
                desc: 'Point your camera at any food product - from snacks to supplements',
                icon: Target,
                color: 'from-blue-500 to-cyan-500',
                delay: '0.2s'
              },
              { 
                step: '03', 
                title: 'AI Analysis', 
                desc: 'Our AI extracts ingredients, analyzes nutrition, and cross-references your profile',
                icon: Brain,
                color: 'from-emerald-500 to-teal-500',
                delay: '0.4s'
              },
              { 
                step: '04', 
                title: 'Get Score', 
                desc: 'Receive your personalized compatibility score with detailed health insights',
                icon: Trophy,
                color: 'from-amber-500 to-orange-500',
                delay: '0.6s'
              }
            ].map((item, i) => {
              const IconComponent = item.icon
              return (
                <div 
                  key={i} 
                  className="relative group animate-fadeIn"
                  style={{animationDelay: item.delay}}
                >
                  <div className="relative bg-white border-2 border-neutral-100 rounded-2xl p-8 text-center hover:border-sage-300 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                    {/* Step Number Badge */}
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10`}>
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                      <IconComponent className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-neutral-800 mb-4 group-hover:text-sage-700 transition-colors duration-300">{item.title}</h3>
                    <p className="text-neutral-600 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
                    
                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sage-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl -z-10"></div>
                  </div>
                  
                  {/* Connection Arrow (except for last item) */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white border-2 border-sage-300 rounded-full flex items-center justify-center shadow-md">
                        <ArrowRight className="w-4 h-4 text-sage-600" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Get Started CTA */}
          <div className="text-center mt-16">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sage-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-sage-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
>>>>>>> 10815b2e770ae885f1207444ac5298c25231944c
        </div>
      </section>


      {/* Minimal Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg flex items-center justify-center font-bold text-white">
                N
              </div>
              <span className="text-xl font-semibold">NutriScan</span>
            </div>
            
            <div className="flex gap-8 text-sm">
              <a href="#" className="text-neutral-300 hover:text-sage-400 transition-colors">Privacy</a>
              <a href="#" className="text-neutral-300 hover:text-sage-400 transition-colors">Terms</a>
              <a href="#" className="text-neutral-300 hover:text-sage-400 transition-colors">Support</a>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center">
            <p className="text-neutral-400 text-sm">© 2026 NutriScan. Personalized nutrition for hormonal health.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
