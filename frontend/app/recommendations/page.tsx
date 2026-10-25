'use client'

import { useEffect, useState } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getRecommendations, getExportCSVUrl } from '@/lib/api'
import { Recommendation } from '@/lib/guardian-engine'
import { formatCurrency } from '@/lib/utils'
import {
  Lightbulb,
  TrendingDown,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  const fetchRecs = async () => {
    try {
      setLoading(true)
      const data = await getRecommendations({
        type: selectedType !== 'ALL' ? selectedType : undefined,
        provider: selectedProvider !== 'ALL' ? selectedProvider : undefined
      })
      setRecommendations(data.recommendations)
    } catch (err) {
      console.error('Failed to load recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecs()
  }, [selectedType, selectedProvider])

  const handleToggleApply = (id: string) => {
    setAppliedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalMonthlySavings = recommendations.reduce((s, r) => s + r.potentialMonthlySavings, 0)
  const totalAnnualSavings = recommendations.reduce((s, r) => s + r.annualSavings, 0)
  const lowRiskCount = recommendations.filter(r => r.riskLevel === 'LOW').length

  return (
    <GuardianLayout title="Optimization Engine & Rightsizing">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-emerald-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Guardian Optimization Engine v1.0
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {formatCurrency(totalMonthlySavings)} / mo Identified Cost Recovery
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Algorithmic recommendations evaluating CPU/RAM percentiles, unattached disk cleanup, and object storage lifecycle policies across your multi-cloud estate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getExportCSVUrl('recommendations')}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/30 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Export Recommendations CSV
            </a>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identified Annual ROI</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalAnnualSavings)}/yr
          </div>
          <div className="text-xs text-slate-500 mt-1">Direct bottom-line cloud budget savings</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actionable Opportunities</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {recommendations.length} Active Targets
          </div>
          <div className="text-xs text-slate-500 mt-1">Across Compute, Storage, and Databases</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low-Risk Immediate Wins</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {lowRiskCount} Opportunities
          </div>
          <div className="text-xs text-slate-500 mt-1">Zero downtime, low operational risk</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Type:</span>
          {['ALL', 'RIGHTSIZING', 'IDLE_CLEANUP', 'UNATTACHED_VOLUME', 'STORAGE_TIERING'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedType === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
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
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            Evaluating multi-cloud rightsizing heuristics...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No optimization recommendations match the specified filter.
          </div>
        ) : (
          recommendations.map((rec) => {
            const isExpanded = expandedId === rec.id
            const isApplied = appliedIds.has(rec.id)

            return (
              <div
                key={rec.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  isApplied
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rec.provider}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {rec.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.riskLevel === 'LOW'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          Risk: {rec.riskLevel}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {rec.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span>Current:</span>
                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                            {rec.currentConfiguration}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <span>Recommended:</span>
                          <span className="font-mono font-bold">
                            {rec.recommendedConfiguration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Savings & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Estimated Savings</div>
                        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(rec.potentialMonthlySavings)}/mo
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatCurrency(rec.annualSavings)}/yr
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition"
                        >
                          <span>{isExpanded ? 'Hide Steps' : 'View Runbook'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleApply(rec.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                            isApplied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isApplied ? 'Reviewed' : 'Acknowledge'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Runbook Steps */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-emerald-500" />
                        Execution Runbook & Remediation Protocol:
                      </div>
                      <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {rec.actionableSteps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </GuardianLayout>
  )
}
