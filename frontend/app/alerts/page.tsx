'use client'

import { useEffect, useState } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getAlerts, updateAlertStatus } from '@/lib/api'
import { ThresholdAlert } from '@/lib/guardian-engine'
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  Clock,
  ShieldAlert,
  Sliders,
  DollarSign
} from 'lucide-react'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ThresholdAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [budgetThreshold, setBudgetThreshold] = useState<number>(3200)

  const fetchAlertsData = async () => {
    try {
      setLoading(true)
      const data = await getAlerts()
      setAlerts(data.alerts)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertsData()
  }, [])

  const handleAction = async (id: string, action: 'ACKNOWLEDGE' | 'RESOLVE') => {
    try {
      await updateAlertStatus(id, action)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: action === 'ACKNOWLEDGE' ? 'ACKNOWLEDGED' : 'RESOLVED' } : a))
    } catch (err) {
      console.error('Failed to update alert:', err)
    }
  }

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && a.status === 'ACTIVE').length
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length

  return (
    <GuardianLayout title="Threshold-Based Alerts & Anomaly Triggers">
      {/* Alert KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-500 uppercase tracking-wider">
            <span>Critical Severity Triggers</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {loading ? '...' : `${criticalCount} Active`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requires immediate remediation to stop overrun</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <span>Warning Anomalies</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {loading ? '...' : `${warningCount} Active`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Unattached disks & approaching budget limits</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            <span>Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : `${resolvedCount} Closed`}
          </div>
          <div className="text-xs text-slate-500 mt-1">Acknowledged or mitigated by operators</div>
        </div>
      </div>

      {/* Threshold Control Simulator */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Budget Anomaly Threshold</h3>
            <p className="text-xs text-slate-500">Alert triggers if projected monthly spend crosses threshold limit</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              value={budgetThreshold}
              onChange={(e) => setBudgetThreshold(Number(e.target.value))}
              className="w-20 bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none"
            />
            <span className="text-slate-400">/month</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
            Live Enforced
          </span>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Telemetry Alert Stream</h3>
            <p className="text-xs text-slate-500">Real-time alerts generated by threshold monitor</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{alerts.length} total events</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Evaluating threshold telemetry stream...</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Zero active alerts. System healthy.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  alert.status === 'RESOLVED'
                    ? 'opacity-50 bg-slate-50/50 dark:bg-slate-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  }`}>
                    {alert.severity === 'CRITICAL' ? (
                      <AlertOctagon className="w-4 h-4" />
                    ) : alert.severity === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {alert.category}
                      </span>
                      {alert.status === 'RESOLVED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>Threshold: <strong className="text-slate-700 dark:text-slate-300 font-mono">{alert.thresholdValue}</strong></span>
                      <span>&bull;</span>
                      <span>Observed: <strong className="text-rose-600 dark:text-rose-400 font-mono">{alert.currentValue}</strong></span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.triggeredAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alert Actions */}
                <div className="flex items-center gap-2 pl-11 md:pl-0 flex-shrink-0">
                  {alert.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleAction(alert.id, 'ACKNOWLEDGE')}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      onClick={() => handleAction(alert.id, 'RESOLVE')}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GuardianLayout>
  )
}
