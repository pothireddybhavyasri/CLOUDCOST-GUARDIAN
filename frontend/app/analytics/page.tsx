'use client'

import { useEffect, useState } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getUtilizationMetrics } from '@/lib/api'
import { UtilizationDataPoint } from '@/lib/guardian-engine'
import { useTheme } from '@/components/theme/ThemeProvider'
import { Activity, Cpu, HardDrive, Wifi, TrendingUp, AlertCircle } from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function AnalyticsPage() {
  const [dataPoints, setDataPoints] = useState<UtilizationDataPoint[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const res = await getUtilizationMetrics()
        setDataPoints(res.dataPoints)
        setSummary(res.summary)
      } catch (err) {
        console.error('Failed to load metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  return (
    <GuardianLayout title="Multi-Cloud Utilization & Performance Analytics">
      {/* Analytics KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Peak 24h CPU Load</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {loading ? '...' : `${summary?.peakCpu || 0}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Recorded during peak business hours</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Average Fleet CPU</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {loading ? '...' : `${summary?.averageCpu || 0}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all AWS, Azure, & GCP compute</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Average Memory (RAM)</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {loading ? '...' : `${summary?.averageMemory || 0}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sufficient headroom across cluster nodes</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Storage Utilization</span>
            <HardDrive className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {loading ? '...' : `${summary?.averageStorage || 0}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total provisioned volume allocation</div>
        </div>
      </div>

      {/* Chart 1: 24-Hour CPU & Memory Load */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">24-Hour Fleet CPU & Memory Load Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hourly aggregate telemetry curve for rightsizing baseline analysis
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Average CPU %
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Average Memory %
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading telemetry profile...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="timestamp" stroke={axisColor} tick={{ fontSize: 11 }} />
                <YAxis stroke={axisColor} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: gridColor,
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val}%`]}
                />
                <Area type="monotone" dataKey="avgCpu" name="Avg CPU" stroke="#10b981" fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="avgMemory" name="Avg Memory" stroke="#6366f1" fillOpacity={1} fill="url(#colorMem)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Network I/O Throughput */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Network Traffic & Egress Throughput</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulated aggregate network I/O in Megabits per second (Mbps)
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
            Egress SLA: 10 Gbps Max
          </span>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading network stream...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="timestamp" stroke={axisColor} tick={{ fontSize: 11 }} />
                <YAxis stroke={axisColor} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: gridColor,
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} Mbps`, 'Throughput']}
                />
                <Line type="monotone" dataKey="networkThroughputMbps" name="Throughput (Mbps)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </GuardianLayout>
  )
}
