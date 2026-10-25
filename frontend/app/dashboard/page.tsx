'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getDashboardSummary, DashboardSummary, getExportCSVUrl } from '@/lib/api'
import { formatCurrency, withMinDuration } from '@/lib/utils'
import { useTheme } from '@/components/theme/ThemeProvider'
import {
  DollarSign,
  TrendingDown,
  Lightbulb,
  Bell,
  Server,
  Moon,
  ArrowUpRight,
  ShieldAlert,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#f59e0b',
  AZURE: '#3b82f6',
  GCP: '#10b981',
}

const SERVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b']

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'

  const fetchData = async () => {
    try {
      setRefreshing(true)
      const summary = await withMinDuration(getDashboardSummary(), 400)
      setData(summary)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const pieData = data?.cost_by_service
    ? Object.entries(data.cost_by_service).map(([name, value]) => ({ name, value }))
    : []

  const providerPieData = data?.cost_by_provider
    ? Object.entries(data.cost_by_provider).map(([name, value]) => ({ name, value }))
    : []

  return (
    <GuardianLayout title="Executive Overview & Cloud Telemetry">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CloudCost Guardian Monitoring Active
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Multi-Cloud Infrastructure Health & Spend</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time telemetry, automated idle detection, rightsizing engine, and budget governance across AWS, Azure, and GCP.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh
          </button>
          <a
            href={getExportCSVUrl('resources')}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Projected Monthly Spend</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {loading ? '...' : formatCurrency(data?.total_cost || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+2.4% vs last cycle</span>
            <span>&bull; 3 providers</span>
          </div>
        </div>

        {/* Potential Savings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Identified Monthly Savings</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            {loading ? '...' : formatCurrency(data?.potential_savings || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {loading ? '' : `${data?.recommendations_count || 0} actionable optimizations`}
          </div>
        </div>

        {/* Idle Resources */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Idle / Zombie Resources</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Moon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-3">
            {loading ? '...' : `${data?.idle_resources_count || 0} / ${data?.total_resources || 0}`}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Unattached storage & idle VMs</span>
            <Link href="/idle" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Inspect &rarr;
            </Link>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Threshold Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-3">
            {loading ? '...' : `${data?.unread_alerts || 0} Triggered`}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Budget & anomaly triggers</span>
            <Link href="/alerts" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              View Alerts &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section: 30-Day Cost Trend & Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Spend Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">30-Day Cost Trajectory by Cloud</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily cost telemetry breakdown across AWS, Azure, and Google Cloud
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> AWS
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Azure
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> GCP
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading telemetry charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.daily_costs || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAws" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAzure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGcp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="date"
                    stroke={axisColor}
                    tickFormatter={(val) => val.slice(5)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke={axisColor} tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: gridColor,
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: isDark ? '#fff' : '#000',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Cost']}
                  />
                  <Area type="monotone" dataKey="aws" name="AWS" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAws)" />
                  <Area type="monotone" dataKey="azure" name="Azure" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAzure)" />
                  <Area type="monotone" dataKey="gcp" name="GCP" stroke="#10b981" fillOpacity={1} fill="url(#colorGcp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Service Cost Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Spend by Cloud Service</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allocation by infrastructure service tier</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            {loading ? (
              <div className="text-slate-400 text-sm">Loading distribution...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: gridColor,
                      borderRadius: '0.75rem',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Spend']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Service Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            {pieData.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SERVICE_COLORS[index % SERVICE_COLORS.length] }}
                />
                <span className="truncate text-slate-600 dark:text-slate-400 font-medium">{item.name}:</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold ml-auto">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Optimization Recommendations Preview & Quick Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actionable Recommendations */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                Priority Optimization Recommendations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Highest impact rightsizing and idle reclamation targets calculated by Guardian Engine
              </p>
            </div>
            <Link
              href="/recommendations"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View all ({data?.recommendations_count || 0}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Evaluating recommendations...</div>
            ) : data?.top_recommendations && data.top_recommendations.length > 0 ? (
              data.top_recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{rec.title}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                          {rec.provider || 'MULTI-CLOUD'}
                        </span>
                        <span>Type: {rec.type}</span>
                        {rec.effort && <span>&bull; Effort: {rec.effort}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-11 sm:pl-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Monthly Savings</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      +${rec.potential_savings.toFixed(2)}/mo
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm">No pending recommendations</div>
            )}
          </div>
        </div>

        {/* Quick Multi-Cloud Health Snapshot */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              Infrastructure Inventory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fleet health & allocation status</p>
          </div>

          <div className="space-y-3 my-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Healthy Active Workloads</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{data?.active_resources_count || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Moon className="w-4 h-4 text-purple-500" />
                <span>Idle / Orphaned Disks</span>
              </div>
              <span className="font-bold text-purple-600 dark:text-purple-400">{data?.idle_resources_count || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Triggered Alerts</span>
              </div>
              <span className="font-bold text-amber-600 dark:text-amber-400">{data?.unread_alerts || 0}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/resources"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Browse complete inventory &rarr;
            </Link>
            <span className="text-[11px] text-slate-400 font-mono">15 cloud assets</span>
          </div>
        </div>
      </div>
    </GuardianLayout>
  )
}
