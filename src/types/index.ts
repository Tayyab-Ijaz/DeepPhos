export type EvidenceTier = 'GOLD' | 'SILVER' | 'BRONZE'
export type ResidueType  = 'S' | 'T' | 'Y'
export type SiteStatus   = 'KNOWN' | 'NOVEL' | 'NOT_FOUND'

export interface PhosphoSite {
  site_id: number
  uniprot_id: string
  gene_name?: string
  residue_type: ResidueType
  position: number
  das_score: number
  pds_score: number
  confidence: number
  evidence_tier: EvidenceTier
  record_count: number
  source_PSP: boolean
  source_PhosphoELM: boolean
  source_PTMS: boolean
  sources: string[]
  pmids: number[]
}

export interface ProteinInfo {
  uniprot_id: string
  gene_name?: string
  protein_name?: string
  organism?: string
  taxonomy_id?: number
  sequence_length?: number
  uniprot_status?: string
}

export interface ProteinSitesResponse {
  protein: ProteinInfo
  total_sites: number
  sites: PhosphoSite[]
}

export interface PaginatedSitesResponse {
  total: number
  offset: number
  limit: number
  sites: PhosphoSite[]
}

export interface SiteDetail {
  site: PhosphoSite
  protein: ProteinInfo
  conflicts: SiteConflict[]
}

export interface SiteConflict {
  conflict_id: number
  uniprot_id: string
  residue_type: string
  pos_a: number
  pos_b: number
  distance: number
  conflict_type: string
  das_a: number
  das_b: number
}

export interface BatchInputItem {
  uniprot_id: string
  position: number
  residue?: string
}

export interface BatchResultItem {
  uniprot_id: string
  position: number
  residue?: string
  status: SiteStatus
  das_score?: number
  pds_score?: number
  evidence_tier?: string
  sources: string[]
  pmids: number[]
  prediction_score?: number
  prediction_confidence?: string
}

export interface DBStats {
  total_sites: number
  total_proteins: number
  gold_sites: number
  silver_sites: number
  bronze_sites: number
  sites_PSP: number
  sites_PhosphoELM: number
  sites_PTMS: number
  sites_unattributed: number
  human_proteins: number
  species_breakdown: Record<string, number>
}

export interface DASEntry {
  das_score: number
  count: number
  pct: number
}
