'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Sparkles, BarChart3, Users, CheckSquare, ArrowRight, Zap } from 'lucide-react'
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
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const features = [
    { icon: Sparkles, title: 'AI-Powered Planning', desc: 'Describe your event in plain language and let AI create a structured, actionable plan.' },
    { icon: BarChart3, title: 'Smart Budgeting', desc: 'Track expenses, detect overruns instantly, and get intelligent cost-saving recommendations.' },
    { icon: Users, title: 'Guest & Vendor Management', desc: 'Manage your guest list, track RSVPs, and compare vendor quotations in one place.' },
    { icon: CheckSquare, title: 'Tasks & Timeline', desc: 'Stay organized with AI-suggested tasks, deadlines, and priority management.' },
  ]

  const benefits = [
    'All-in-one event planning workspace',
    'Real-time budget tracking and analysis',
    'Context-aware AI recommendations',
    'Secure and private data management',
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">EventEase AI</span>
          </div>
          <button
            onClick={() => router.push('/auth/signup')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Get started
          </button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 ring-1 ring-blue-700/10">
                  <Zap className="h-3.5 w-3.5" />
                  <span>AI-Powered Event Planning</span>
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Plan events{' '}
                  <span className="text-blue-600">smarter with AI</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Describe your event, define your constraints, and let AI help you create, manage, and adapt your plan with real-time budget tracking and intelligent recommendations.
                </p>
                <ul className="mt-8 space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-slate-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Sign in to your account</h2>
                    <p className="mt-1 text-sm text-slate-600">Access your event planning dashboard</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                      {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => router.push('/auth/signup')}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to plan events
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Powerful features to help you organize, budget, and execute events seamlessly
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">EventEase AI</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 EventEase AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
