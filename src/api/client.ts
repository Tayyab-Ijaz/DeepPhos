import axios from 'axios'
import type {
  ProteinInfo, ProteinSitesResponse, SiteDetail,
  BatchInputItem, BatchResultItem, DBStats, DASEntry, PhosphoSite,
  PaginatedSitesResponse,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 30000,
})

// ── Proteins ──────────────────────────────────────────────────────────────
export const searchProteins = (gene?: string, organism?: string, limit = 20) =>
  api.get<ProteinInfo[]>('/api/v1/protein/search', { params: { gene, organism, limit } })
    .then(r => r.data)

export const getProtein = (uniprotId: string) =>
  api.get<ProteinInfo>(`/api/v1/protein/${uniprotId}`)
    .then(r => r.data)

export const getProteinSites = (
  uniprotId: string,
  params?: { min_das?: number; evidence_tier?: string; residue_type?: string }
) =>
  api.get<ProteinSitesResponse>(`/api/v1/protein/${uniprotId}/sites`, { params })
    .then(r => r.data)

// ── Sites ─────────────────────────────────────────────────────────────────
export const getSiteDetail = (uniprotId: string, residue: string, position: number) =>
  api.get<SiteDetail>(`/api/v1/site/${uniprotId}/${residue}/${position}`)
    .then(r => r.data)

export const getTopSites = (params?: { limit?: number; offset?: number; evidence_tier?: string; taxonomy_id?: number }) =>
  api.get<PaginatedSitesResponse>('/api/v1/site/top', { params })
    .then(r => r.data)

export const getRescuedSites = (params?: { limit?: number; residue_type?: string }) =>
  api.get<PhosphoSite[]>('/api/v1/site/rescued', { params })
    .then(r => r.data)

// ── Batch ─────────────────────────────────────────────────────────────────
export const batchAnnotate = (sites: BatchInputItem[]) =>
  api.post<BatchResultItem[]>('/api/v1/batch/annotate', sites)
    .then(r => r.data)

// ── Stats ─────────────────────────────────────────────────────────────────
export const getStats = () =>
  api.get<DBStats>('/api/v1/stats/overview').then(r => r.data)

export const getDASDistribution = () =>
  api.get<DASEntry[]>('/api/v1/stats/das').then(r => r.data)

export const getSpeciesBreakdown = () =>
  api.get<{ taxonomy_id: number; organism: string; unique_sites: number; proteins: number }[]>(
    '/api/v1/stats/species'
  ).then(r => r.data)

export const getSourceBreakdown = () =>
  api.get<{ source_db: string; site_count: number }[]>('/api/v1/stats/sources')
    .then(r => r.data)
