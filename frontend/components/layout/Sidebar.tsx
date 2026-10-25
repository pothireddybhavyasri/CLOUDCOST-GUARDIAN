'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Server,
  Activity,
  Moon,
  Lightbulb,
  Bell,
  ShieldCheck,
  Cloud,
  FileSpreadsheet,
  Layers,
  ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Resource Inventory', href: '/resources', icon: Server },
  { label: 'Utilization Analytics', href: '/analytics', icon: Activity },
  { label: 'Idle Resource Detection', href: '/idle', icon: Moon, badge: 'Savings' },
  { label: 'Optimization Engine', href: '/recommendations', icon: Lightbulb, badge: 'ROI' },
  { label: 'Threshold Alerts', href: '/alerts', icon: Bell },
  { label: 'Data Quality & Ingestion', href: '/data-quality', icon: Layers },
  { label: 'Cloud Accounts', href: '/accounts', icon: Cloud },
  { label: 'CSV Reports', href: '/reports', icon: FileSpreadsheet },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              CloudCost<span className="text-emerald-400">Guardian</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">Resource & Cost Platform</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/10 text-emerald-300 border-l-2 border-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/70" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry Active
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-300">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          CloudCost Guardian College Project &bull; Multi-Cloud Optimization
        </p>
      </div>
    </aside>
  )
}
