'use client'

import { useState, useEffect } from 'react'
import GuardianLayout from '@/components/layout/GuardianLayout'
import { getAccounts, addAccount } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  Cloud,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Key,
  ExternalLink,
  Copy,
  Check,
  Server
} from 'lucide-react'

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<'AWS' | 'AZURE' | 'GCP'>('AWS')
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Form fields
  const [accountName, setAccountName] = useState('')
  const [accountId, setAccountId] = useState('')

  const fetchAllAccounts = async () => {
    try {
      setLoading(true)
      const data = await getAccounts()
      setAccounts(data.accounts || [])
    } catch (err) {
      console.error('Failed to load accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAccounts()
  }, [])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName) return

    try {
      setSubmitting(true)
      await addAccount({
        name: accountName,
        provider: activeTab,
        accountId: accountId || undefined
      })
      setSuccessMsg(`Successfully connected ${activeTab} account "${accountName}" to CloudCost Guardian!`)
      setShowModal(false)
      setAccountName('')
      setAccountId('')
      fetchAllAccounts()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      console.error('Failed to add account:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const totalSpend = accounts.reduce((s, a) => s + (a.monthlySpend || 0), 0)

  return (
    <GuardianLayout title="Connected Multi-Cloud Accounts">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-800/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <Cloud className="w-3.5 h-3.5" />
            Multi-Cloud Integration Hub
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Connected Cloud Tenancies & IAM Linkage
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Manage cost ingestion connectors for Amazon Web Services (AWS Organizations), Microsoft Azure (Enterprise Subscriptions), and Google Cloud Platform (Billing Accounts).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/30 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Connect New Cloud Account
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Connected Accounts List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Cloud Accounts</h3>
            <p className="text-xs text-slate-500">Live telemetry sync status and resource volume</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{accounts.length} active connectors</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Querying account registry...</div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No cloud accounts configured. Connect your first account above.
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    acc.provider === 'AWS'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : acc.provider === 'AZURE'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <Cloud className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{acc.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {acc.provider}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        {acc.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                      <span>Account ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{acc.accountId}</strong></span>
                      <span>&bull;</span>
                      <span>Sync: <strong className="text-slate-700 dark:text-slate-300">{acc.lastSync}</strong></span>
                      <span>&bull;</span>
                      <span>Monitored Assets: <strong className="text-slate-700 dark:text-slate-300">{acc.resourceCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Monthly Run-Rate</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {formatCurrency(acc.monthlySpend)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Connect Cloud Tenancy</h3>
                <p className="text-xs text-slate-500">Link AWS, Azure, or GCP credentials</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              {/* Provider Selector */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">Cloud Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['AWS', 'AZURE', 'GCP'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setActiveTab(prov)}
                      className={`py-2 rounded-xl font-bold transition ${
                        activeTab === prov
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Friendly Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production Workloads"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Account / Subscription ID</label>
                <input
                  type="text"
                  placeholder="e.g. 12-digit AWS ID or Azure Subscription UUID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-slate-500 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Read-Only Non-Destructive Ingestion
                </div>
                <p>Guardian connects via read-only Cost Explorer and CloudWatch APIs. No administrative write access requested.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
                >
                  {submitting ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuardianLayout>
  )
}
