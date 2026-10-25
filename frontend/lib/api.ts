import axios from 'axios'
import type {
  CloudResource,
  Recommendation,
  ThresholdAlert,
  DataQualityReport,
  UtilizationDataPoint
} from './guardian-engine'

// If NEXT_PUBLIC_API_URL is configured, use it (e.g. external Go service).
// Otherwise default to empty string so requests hit relative /api/v1 on the Next.js origin.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to client-side requests if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role?: string
  }
}

export interface DashboardSummary {
  total_cost: number
  cost_by_service: Record<string, number>
  cost_by_provider?: Record<string, number>
  recommendations_count: number
  potential_savings: number
  unread_alerts: number
  daily_costs: Array<{ date: string; cost: number; aws?: number; gcp?: number; azure?: number }>
  top_recommendations: Array<{
    id: string
    title: string
    potential_savings: number
    type: string
    provider?: string
    effort?: string
  }>
  total_resources?: number
  idle_resources_count?: number
  active_resources_count?: number
  data_mode?: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get('/dashboard/summary')
  return response.data
}

export async function getMe() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function getResources(params?: {
  provider?: string
  status?: string
  type?: string
  search?: string
  idle?: boolean
}): Promise<{ count: number; total_filtered_cost: number; resources: CloudResource[] }> {
  const response = await api.get('/resources', { params })
  return response.data
}

export async function getResourceById(id: string): Promise<{ resource: CloudResource; telemetry: any }> {
  const response = await api.get(`/resources/${id}`)
  return response.data
}

export async function getUtilizationMetrics(): Promise<{
  interval: string
  dataPoints: UtilizationDataPoint[]
  summary: { peakCpu: number; averageCpu: number; averageMemory: number; averageStorage: number }
}> {
  const response = await api.get('/metrics/utilization')
  return response.data
}

export async function getRecommendations(params?: { type?: string; provider?: string }): Promise<{
  count: number
  total_potential_monthly_savings: number
  total_potential_annual_savings: number
  recommendations: Recommendation[]
}> {
  const response = await api.get('/recommendations', { params })
  return response.data
}

export async function getAlerts(): Promise<{
  count: number
  critical_count: number
  warning_count: number
  alerts: ThresholdAlert[]
}> {
  const response = await api.get('/alerts')
  return response.data
}

export async function updateAlertStatus(alertId: string, action: 'ACKNOWLEDGE' | 'RESOLVE') {
  const response = await api.post('/alerts', { alertId, action })
  return response.data
}

export async function getDataQuality(): Promise<{
  report: DataQualityReport
  pipeline: any
}> {
  const response = await api.get('/data-quality')
  return response.data
}

export async function getAccounts(): Promise<{
  accounts: any[]
  total_accounts: number
  total_monthly_spend: number
}> {
  const response = await api.get('/accounts')
  return response.data
}

export async function addAccount(accountData: { name: string; provider: string; accountId?: string }) {
  const response = await api.post('/accounts', accountData)
  return response.data
}

export function getExportCSVUrl(type: 'resources' | 'recommendations' = 'resources'): string {
  return `${API_BASE_URL}/api/v1/export/csv?type=${type}`
}

export default api
