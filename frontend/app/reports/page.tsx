'use client'

import { useState } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getExportCSVUrl } from '@/lib/api'
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Table,
  FileText,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react'

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = (type: 'resources' | 'recommendations') => {
    setDownloading(type)
    const url = getExportCSVUrl(type)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cloudcost-guardian-${type}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setDownloading(null), 1000)
  }

  return (
    <GuardianLayout title="Reports & CSV Data Export Center">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-800/40 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              RFC-4180 Standard CSV Export
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Data Exports & Executive Audit Reports
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Export comprehensive multi-cloud inventory, cost allocation metrics, and algorithmic rightsizing recommendations formatted for spreadsheets, BI ingestion, or academic submission.
            </p>
          </div>
        </div>
      </div>

      {/* Available Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Complete Resource Inventory */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Table className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Live Dataset
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Cloud Resource Inventory & Telemetry
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Full inventory across AWS, Azure, and GCP including instance types, regions, utilization metrics (CPU, RAM, Disk, Network I/O), hourly run rates, and idle classifications.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Columns:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">17 standard fields</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">CSV (RFC-4180 UTF-8)</span>
              </div>
              <div className="flex justify-between">
                <span>Schema:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">FOCUS 1.0 Aligned</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDownload('resources')}
            disabled={downloading === 'resources'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/30 transition"
          >
            <Download className={`w-4 h-4 ${downloading === 'resources' ? 'animate-bounce' : ''}`} />
            <span>{downloading === 'resources' ? 'Generating CSV...' : 'Download Resource Inventory CSV'}</span>
          </button>
        </div>

        {/* Report 2: Optimization Recommendations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                ROI Analysis
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Optimization Recommendations & Cost Recovery
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Algorithmic recommendations including instance downsizing targets, unattached disk volume deletions, storage lifecycle transitions, monthly/annual savings projections, and risk ratings.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Columns:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">14 recommendation fields</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">CSV (RFC-4180 UTF-8)</span>
              </div>
              <div className="flex justify-between">
                <span>Calculations:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">720 hours/month basis</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDownload('recommendations')}
            disabled={downloading === 'recommendations'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition"
          >
            <Download className={`w-4 h-4 ${downloading === 'recommendations' ? 'animate-bounce' : ''}`} />
            <span>{downloading === 'recommendations' ? 'Generating CSV...' : 'Download Recommendations CSV'}</span>
          </button>
        </div>
      </div>
    </GuardianLayout>
  )
}
