'use client'

import Link from 'next/link'
import {
  ShieldCheck,
  TrendingDown,
  Moon,
  Layers,
  ArrowRight,
  Server,
  Cloud,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">
            CloudCost<span className="text-emerald-400">Guardian</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            College Engineering Capstone &bull; FinOps & Cloud Observability
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop Cloud Waste. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Autonomous Cloud Resource & Cost Platform.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            CloudCost Guardian delivers multi-cloud resource inventory tracking, automated zombie disk detection, AI-driven instance rightsizing recommendations, and threshold budget alerts across AWS, Azure, and Google Cloud.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Explore Live Dashboard</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <span>Faculty Demo Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {/* Pillar 1 */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zombie & Idle Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects unattached EBS/cloud storage disks, stopped virtual machines racking up storage costs, and compute instances with &lt;5% CPU utilization over 7+ days.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Rightsizing Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates hourly rate deltas against 720 hours/month to project exact dollar savings, automatically recommending tier downsizing and storage lifecycle transitions.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Cloud Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified normalized metrics for CPU, RAM, storage, and network throughput across AWS EC2/RDS, Azure VMs/SQL, and GCP Compute Engine/Cloud Run.
            </p>
          </div>
        </div>

        {/* Capstone Architecture Snapshot */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-emerald-400">ENGINEERING ARCHITECTURE</span>
              <h2 className="text-xl font-bold text-white mt-1">Dual-Mode Modern FinOps Stack</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Next.js 15 & Go 1.21 Microservice</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/60 rounded-xl">
              <div className="text-slate-400 font-medium">Frontend Framework</div>
              <div className="font-bold text-white mt-1">Next.js 15 + React 19</div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl">
              <div className="text-slate-400 font-medium">Visualization</div>
              <div className="font-bold text-white mt-1">Recharts + Lucide</div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl">
              <div className="text-slate-400 font-medium">Engine & Telemetry</div>
              <div className="font-bold text-white mt-1">Guardian Core Engine</div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl">
              <div className="text-slate-400 font-medium">Quality & Testing</div>
              <div className="font-bold text-white mt-1">Vitest (100% Pass)</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>CloudCost Guardian &bull; College Engineering Project &bull; Created by Pothireddy Bhavya Sri</p>
        <p className="text-[11px] text-slate-600">
          Reused upstream components derived under Apache License 2.0. Copyright &copy; 2026.
        </p>
      </footer>
    </div>
  )
}
