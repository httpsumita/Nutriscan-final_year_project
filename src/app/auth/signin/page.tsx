'use client'

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import Link from "next/link"
import { Leaf } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.ok) {
      router.push('/dashboard')
    } else {
      setError('Failed to sign in. Check your credentials and try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-0">
      {/* Background accent */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-sage-200 rounded-full opacity-30 blur-3xl -z-10"></div>

      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-sage-400 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-medium text-neutral-600">NutriScan</span>
          </div>
          <h1 className="text-3xl font-medium text-neutral-600">Welcome</h1>
          <p className="text-neutral-600 opacity-75 text-sm mt-2">Sign in to your hormonal health account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-sage-700 text-white font-medium py-3 rounded-lg hover:bg-sage-800 transition"
            >
              Sign In
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 text-center">
              <strong className="text-neutral-700">Demo Credentials:</strong>
            </p>
            <p className="text-xs text-neutral-600 text-center mt-2 font-mono bg-neutral-50 p-3 rounded">
              Email: demo@nutriscan.com<br />
              Password: demo123
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-neutral-600 mt-6">
          New to NutriScan?{' '}
          <Link href="/auth/signup" className="text-sage-700 font-medium hover:text-sage-800">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
