'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Sparkles, BarChart3, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const features = [
    { icon: Sparkles, title: 'AI-Powered Planning', desc: 'Describe your event in plain language and let AI create a structured plan.' },
    { icon: BarChart3, title: 'Smart Budgeting', desc: 'Track expenses, detect overruns, and get actionable recommendations.' },
    { icon: Users, title: 'Guest & Vendor Management', desc: 'Manage guests, RSVPs, and vendor quotations in one place.' },
    { icon: Calendar, title: 'Tasks & Timeline', desc: 'Stay on track with intelligent task suggestions and deadlines.' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">EventEase AI</span>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Plan events smarter with AI
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Describe your event, define your constraints, and let AI help you create, manage, and adapt your plan with real-time budget tracking and intelligent recommendations.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                    <h3 className="mt-2 font-medium text-slate-900">{feature.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-600">Access your event planning dashboard</p>
                
                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
                <p className="mt-5 text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
