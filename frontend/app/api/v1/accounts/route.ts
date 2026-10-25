import { NextResponse } from 'next/server'

interface CloudAccountRecord {
  id: string
  name: string
  provider: 'AWS' | 'AZURE' | 'GCP'
  accountId: string
  status: 'CONNECTED' | 'SYNCING' | 'PENDING'
  monthlySpend: number
  resourceCount: number
  lastSync: string
}

const mockAccounts: CloudAccountRecord[] = [
  {
    id: 'acc-aws-01',
    name: 'AWS Production Enterprise',
    provider: 'AWS',
    accountId: '1284-9021-3482',
    status: 'CONNECTED',
    monthlySpend: 2174.41,
    resourceCount: 7,
    lastSync: '2 minutes ago'
  },
  {
    id: 'acc-azure-01',
    name: 'Azure Core Workloads',
    provider: 'AZURE',
    accountId: 'sub-89a3-4812-bf91',
    status: 'CONNECTED',
    monthlySpend: 965.76,
    resourceCount: 4,
    lastSync: '5 minutes ago'
  },
  {
    id: 'acc-gcp-01',
    name: 'GCP Data & Analytics Project',
    provider: 'GCP',
    accountId: 'gcp-guardian-prod-88',
    status: 'CONNECTED',
    monthlySpend: 742.20,
    resourceCount: 4,
    lastSync: '1 minute ago'
  }
]

export async function GET() {
  return NextResponse.json({
    accounts: mockAccounts,
    total_accounts: mockAccounts.length,
    total_monthly_spend: Number(mockAccounts.reduce((s, a) => s + a.monthlySpend, 0).toFixed(2))
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newAccount: CloudAccountRecord = {
      id: `acc-${body.provider.toLowerCase()}-${Date.now().toString(36)}`,
      name: body.name || `${body.provider} Account`,
      provider: body.provider,
      accountId: body.accountId || `sim-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'CONNECTED',
      monthlySpend: 0,
      resourceCount: 0,
      lastSync: 'Just now'
    }

    mockAccounts.push(newAccount)
    return NextResponse.json({ success: true, account: newAccount })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add cloud account' }, { status: 400 })
  }
}
