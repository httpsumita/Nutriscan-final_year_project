'use client'

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

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
      setError('Failed to sign in')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">NutriScan</h1>
        <p className="text-center text-slate-600 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <div className="text-sm font-medium">Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium">Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Demo: Use any email address to create an account
        </p>
      </div>
    </div>
  )
}
