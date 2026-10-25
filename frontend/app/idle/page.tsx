'use client'

import { useEffect, useState } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getResources } from '@/lib/api'
import { CloudResource } from '@/lib/guardian-engine'
import { formatCurrency } from '@/lib/utils'
import {
  Moon,
  AlertOctagon,
  HardDrive,
  Server,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  PauseCircle
} from 'lucide-react'

export default function IdleResourcesPage() {
  const [idleResources, setIdleResources] = useState<CloudResource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIdle = async () => {
      try {
        setLoading(true)
        const res = await getResources({ idle: true })
        setIdleResources(res.resources)
      } catch (err) {
        console.error('Failed to load idle resources:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchIdle()
  }, [])

  const totalWastedMonthly = idleResources.reduce((s, r) => s + r.monthlyCost, 0)
  const annualWaste = totalWastedMonthly * 12
  const unattachedDisks = idleResources.filter(r => r.unattachedStorage)
  const stoppedInstances = idleResources.filter(r => r.status === 'STOPPED')
  const zombieCompute = idleResources.filter(r => !r.unattachedStorage && r.status !== 'STOPPED')

  return (
    <GuardianLayout title="Idle & Zombie Cloud Resource Detection">
      {/* Waste Summary Alert Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 p-6 rounded-2xl border border-purple-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
              <Moon className="w-3.5 h-3.5" />
              Automated Waste & Zombie Scan
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {formatCurrency(totalWastedMonthly)} / month in Recoverable Idle Spend
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Guardian detected {idleResources.length} unattached storage volumes and idle compute workloads generating zero operational business value.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-purple-500/30">
            <div>
              <div className="text-xs text-purple-300 font-medium">Estimated Annual Cost Recovery</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {formatCurrency(annualWaste)}/yr
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Categorization Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Orphaned Disks (100% Waste)</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {unattachedDisks.length} Volumes
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            {formatCurrency(unattachedDisks.reduce((s, r) => s + r.monthlyCost, 0))}/mo wasted
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Stopped Instances (Storage Cost)</span>
            <PauseCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stoppedInstances.length} Instances
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            {formatCurrency(stoppedInstances.reduce((s, r) => s + r.monthlyCost, 0))}/mo wasted
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Zombie Compute (&lt;5% CPU)</span>
            <Server className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {zombieCompute.length} Workloads
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
            {formatCurrency(zombieCompute.reduce((s, r) => s + r.monthlyCost, 0))}/mo wasted
          </div>
        </div>
      </div>

      {/* Idle Resources Detailed Inventory */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Detected Idle Cloud Assets</h3>
            <p className="text-xs text-slate-500">Exhaustive list of idle resources with inactivity duration</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Non-destructive Audit</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Auditing idle cloud inventory...</div>
          ) : idleResources.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Zero idle resources detected! Your cloud fleet is operating at peak efficiency.
            </div>
          ) : (
            idleResources.map((res) => (
              <div key={res.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{res.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {res.provider}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {res.unattachedStorage ? 'Unattached Disk' : res.status === 'STOPPED' ? 'Stopped VM' : 'Zombie VM'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Service: <strong className="text-slate-700 dark:text-slate-300">{res.service}</strong></span>
                    <span>&bull;</span>
                    <span>Type: <strong className="text-slate-700 dark:text-slate-300">{res.instanceType}</strong></span>
                    <span>&bull;</span>
                    <span>Region: <strong className="text-slate-700 dark:text-slate-300">{res.region}</strong></span>
                    <span>&bull;</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      Idle for {res.idleDays} days
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-2">
                    <strong className="text-emerald-600 dark:text-emerald-400">Recommended Action: </strong>
                    {res.unattachedStorage
                      ? 'Snapshot data if retention required, then delete unattached volume via console.'
                      : res.status === 'STOPPED'
                      ? 'Create image archive (AMI/VHD) and terminate the stopped instance to stop storage billing.'
                      : 'Review background processes; migrate or decommission instance to reclaim compute budget.'}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-400">Wasted Spend</div>
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(res.monthlyCost)}/mo
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ${(res.monthlyCost * 12).toFixed(2)}/yr
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GuardianLayout>
  )
}
