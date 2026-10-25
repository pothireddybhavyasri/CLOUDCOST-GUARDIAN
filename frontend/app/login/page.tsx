'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { ShieldCheck, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleLogin = async (e?: React.FormEvent, demoUser?: { email: string; pass: string }) => {
    if (e) e.preventDefault()
    setError('')

    const loginEmail = demoUser ? demoUser.email : email
    const loginPass = demoUser ? demoUser.pass : password

    if (demoUser) {
      setDemoLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await login(loginEmail, loginPass)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
      setDemoLoading(false)
    }
  }

  const handleDemoAccess = () => {
    handleLogin(undefined, {
      email: 'evaluator@college.edu',
      pass: 'guardianDemo2026!'
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            CloudCost<span className="text-emerald-400">Guardian</span>
          </h1>
          <p className="text-xs text-slate-400">Cloud Resource Usage & Optimization Platform</p>
        </div>

        {/* Instant Demo Access Button */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
          <div className="text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Faculty & Evaluator Quick Access
          </div>
          <p className="text-[11px] text-slate-300">
            One-click entry to explore live telemetry, idle detection, and rightsizing engine.
          </p>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={demoLoading || loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/30 transition"
          >
            {demoLoading ? <Spinner className="h-4 w-4" /> : <ArrowRight className="w-4 h-4" />}
            <span>Launch Instant Demo Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Or Sign In</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-2.5 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="engineer@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition"
          >
            {loading ? <Spinner className="h-4 w-4" /> : 'Sign In with Credentials'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-emerald-400 hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
