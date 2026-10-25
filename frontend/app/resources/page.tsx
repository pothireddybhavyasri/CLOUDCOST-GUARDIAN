'use client'

import { useEffect, useState } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getResources, getExportCSVUrl } from '@/lib/api'
import { CloudResource } from '@/lib/guardian-engine'
import { formatCurrency } from '@/lib/utils'
import {
  Server,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Moon,
  ExternalLink,
  Cpu,
  HardDrive,
  Activity,
  Layers
} from 'lucide-react'

export default function ResourcesPage() {
  const [resources, setResources] = useState<CloudResource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null)

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = await getResources({
        provider: selectedProvider !== 'ALL' ? selectedProvider : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        type: selectedType !== 'ALL' ? selectedType : undefined,
        search: searchQuery || undefined
      })
      setResources(data.resources)
    } catch (err) {
      console.error('Failed to load resources:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [selectedProvider, selectedStatus, selectedType, searchQuery])

  const totalCost = resources.reduce((s, r) => s + r.monthlyCost, 0)
  const idleCount = resources.filter(r => r.isIdle).length

  return (
    <GuardianLayout title="Cloud Resource Inventory & Fleet Health">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtered Fleet Size</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{resources.length} Assets</div>
          <div className="text-xs text-slate-500 mt-1">Multi-cloud compute, databases, storage & serverless</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Combined Monthly Run-Rate</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalCost)}</div>
          <div className="text-xs text-slate-500 mt-1">Based on active hourly provider rates (720 hrs/mo)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Idle / Zombie Assets</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{idleCount} Detected</div>
          <div className="text-xs text-slate-500 mt-1">Unattached disks, stopped VMs, and idle compute</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by resource name, service, instance type, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href={getExportCSVUrl('resources')}
              download
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Export Inventory CSV
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Provider Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Cloud:</span>
            {['ALL', 'AWS', 'AZURE', 'GCP'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedProvider === p
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
            <span className="text-slate-500 font-medium">Type:</span>
            {['ALL', 'COMPUTE', 'STORAGE', 'DATABASE', 'SERVERLESS'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
            <span className="text-slate-500 font-medium">Status:</span>
            {['ALL', 'ACTIVE', 'IDLE', 'OVER_PROVISIONED', 'STOPPED'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedStatus === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Resource & Service</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Type / Class</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Health Status</th>
                <th className="px-4 py-3">CPU / RAM / Disk</th>
                <th className="px-4 py-3 text-right">Monthly Spend</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Scanning cloud resource inventory...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No cloud resources matched the specified filters.
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedResource(res)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {res.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{res.service} &bull; {res.id}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        res.provider === 'AWS'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : res.provider === 'AZURE'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {res.provider}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {res.instanceType}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {res.region}
                    </td>

                    <td className="px-4 py-3.5">
                      {res.isIdle ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          <Moon className="w-3 h-3" />
                          Idle ({res.idleDays}d)
                        </span>
                      ) : res.status === 'OVER_PROVISIONED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Over-sized
                        </span>
                      ) : res.status === 'STOPPED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          Stopped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Active Healthy
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        <span title="Average CPU load">{res.cpuUtilization.toFixed(0)}% CPU</span>
                        <span>/</span>
                        <span title="Memory utilization">{res.memoryUtilization.toFixed(0)}% RAM</span>
                        <span>/</span>
                        <span title="Storage allocation">{res.storageUtilization.toFixed(0)}% Disk</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      ${res.monthlyCost.toFixed(2)}
                      <div className="text-[10px] font-normal text-slate-400 font-mono">
                        ${res.hourlyCost.toFixed(3)}/hr
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedResource(res)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{selectedResource.provider} &bull; {selectedResource.service}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedResource.name}</h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl">
                <div>
                  <span className="text-slate-500">Instance Class:</span>
                  <div className="font-semibold font-mono text-slate-900 dark:text-white">{selectedResource.instanceType}</div>
                </div>
                <div>
                  <span className="text-slate-500">Region:</span>
                  <div className="font-semibold font-mono text-slate-900 dark:text-white">{selectedResource.region}</div>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Run Rate:</span>
                  <div className="font-bold text-slate-900 dark:text-white">${selectedResource.monthlyCost.toFixed(2)}/mo</div>
                </div>
                <div>
                  <span className="text-slate-500">Hourly Rate:</span>
                  <div className="font-mono text-slate-900 dark:text-white">${selectedResource.hourlyCost.toFixed(4)}/hr</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CPU Utilization:</span>
                  <span className="font-bold">{selectedResource.cpuUtilization}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedResource.cpuUtilization}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Memory Utilization:</span>
                  <span className="font-bold">{selectedResource.memoryUtilization}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedResource.memoryUtilization}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 mb-1">Tags & Attribution:</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(selectedResource.tags).map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono text-[10px]">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-xs hover:opacity-90 transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </GuardianLayout>
  )
}
