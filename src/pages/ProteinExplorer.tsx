import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import { ExternalLink, ChevronUp, ChevronDown, Dna } from 'lucide-react'
import { getProteinSites, searchProteins } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, ResidueBadge, DASBadge } from '../components/ui/Badge'
import { EvidenceBar } from '../components/ui/EvidenceBar'
import { uniprotUrl, fmtNumber } from '../utils/format'
import type { PhosphoSite, ProteinInfo } from '../types'
import type { ReactNode } from 'react'

const TIERS    = ['ALL', 'GOLD', 'SILVER', 'BRONZE'] as const
const RESIDUES = ['ALL', 'S', 'T', 'Y'] as const

const TIER_META: Record<string, { color: string; bg: string; border: string }> = {
  GOLD:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  SILVER: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  BRONZE: { color: '#b45309', bg: '#fefce8', border: '#fef08a' },
}

const DetailChip = ({ label, value }: { label: string; value: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-faint)' }}>{label}</span>
    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
  </div>
)

export const ProteinExplorer = () => {
  const { uniprotId } = useParams<{ uniprotId: string }>()
  const navigate = useNavigate()
  const [protein,      setProtein]      = useState<ProteinInfo | null>(null)
  const [sites,        setSites]        = useState<PhosphoSite[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [sorting,      setSorting]      = useState<SortingState>([{ id: 'das_score', desc: true }])
  const [tierFilter,   setTierFilter]   = useState<string>('ALL')
  const [resFilter,    setResFilter]    = useState<string>('ALL')
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (!uniprotId) return
    let cancelled = false
    setLoading(true); setError('')
    getProteinSites(uniprotId)
      .then(r => { if (!cancelled) { setProtein(r.protein); setSites(r.sites); setLoading(false) } })
      .catch(() => {
        searchProteins(uniprotId, undefined, 25)
          .then(res => { if (!cancelled) { if (res.length) navigate(`/protein/${res[0].uniprot_id}`, { replace: true }); else { setError(`No protein found for "${uniprotId}".`); setLoading(false) } } })
          .catch(() => { if (!cancelled) { setError(`No protein found for "${uniprotId}".`); setLoading(false) } })
      })
    return () => { cancelled = true }
  }, [uniprotId, navigate])

  const filtered = useMemo(() => sites.filter(s =>
    (tierFilter === 'ALL' || s.evidence_tier === tierFilter) &&
    (resFilter  === 'ALL' || s.residue_type  === resFilter)
  ), [sites, tierFilter, resFilter])

  const columns = useMemo<ColumnDef<PhosphoSite>[]>(() => [
    { accessorKey: 'residue_type',  header: 'Res',      size: 52,  cell: ({ getValue }) => <ResidueBadge type={getValue<string>()} /> },
    { accessorKey: 'position',      header: 'Position', size: 86,  cell: ({ getValue }) => <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.82rem', fontWeight:700 }}>{getValue<number>()}</span> },
    { accessorKey: 'evidence_tier', header: 'Tier',     size: 80,  cell: ({ getValue }) => <TierBadge tier={getValue<string>()} /> },
    { accessorKey: 'das_score',     header: 'DAS',      size: 68,  cell: ({ getValue }) => <DASBadge das={getValue<number>()} /> },
    { accessorKey: 'pds_score',     header: 'PDS',      size: 58,  cell: ({ getValue }) => <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem', color:'var(--color-muted)' }}>{getValue<number>()}</span> },
    { id: 'sources', header: 'Evidence', cell: ({ row }) => <EvidenceBar sources={row.original.sources ?? []} pds={row.original.pds_score} /> },
    { id: 'link',    header: '',  size: 60,  cell: ({ row }) => (
      <Link to={`/site/${uniprotId}/${row.original.residue_type}/${row.original.position}`}
        style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--color-primary)', textDecoration:'none' }}>
        View →
      </Link>
    )},
  ], [uniprotId])

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
  })

  if (loading) return <LoadingSpinner label={`Loading ${uniprotId}…`} />
  if (error)   return <div className="page-wrap" style={{ maxWidth: 640, margin: '0 auto' }}><ErrorBox message={error} /></div>
  if (!protein) return null

  const tierCounts: Record<string, number> = {}
  sites.forEach(s => { tierCounts[s.evidence_tier] = (tierCounts[s.evidence_tier] ?? 0) + 1 })

  return (
    <div className="page-wrap">

      {/* Protein header */}
      <div className="card-blue" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, width: 44, borderRadius: 11, background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#fff' }}>
              <Dna size={21} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  {protein.gene_name ?? uniprotId}
                </h1>
                <a href={uniprotUrl(protein.uniprot_id)} target="_blank" rel="noreferrer"
                   style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'0.75rem', fontWeight:600, color:'var(--color-primary)', textDecoration:'none', background:'var(--color-bg)', padding:'3px 9px', borderRadius:99, border:'1px solid var(--color-border-blue)', fontFamily:"'JetBrains Mono',monospace" }}>
                  {protein.uniprot_id} <ExternalLink size={11} />
                </a>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {protein.protein_name    && <DetailChip label="Protein" value={protein.protein_name} />}
                {protein.organism        && <DetailChip label="Organism" value={<em>{protein.organism}</em>} />}
                {protein.sequence_length && <DetailChip label="Length" value={`${fmtNumber(protein.sequence_length)} aa`} />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {(['GOLD','SILVER','BRONZE'] as const).map(t => (
              <div key={t} style={{ background: TIER_META[t].bg, border: `1px solid ${TIER_META[t].border}`, borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 64 }}>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.1rem', fontWeight:800, color: TIER_META[t].color, margin: '0 0 2px' }}>
                  {fmtNumber(tierCounts[t] ?? 0)}
                </p>
                <p style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color: TIER_META[t].color, opacity: 0.75, margin: 0 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span className="section-label" style={{ margin: 0, marginRight: 2 }}>Tier:</span>
          {TIERS.map(t => <button key={t} onClick={() => setTierFilter(t)} className={`pill ${tierFilter === t ? 'pill-active' : ''}`}>{t}</button>)}
        </div>
        <div style={{ width: 1, height: 18, background: 'var(--color-border-blue)', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span className="section-label" style={{ margin: 0, marginRight: 2 }}>Res:</span>
          {RESIDUES.map(r => <button key={r} onClick={() => setResFilter(r)} className={`pill ${resFilter === r ? 'pill-active' : ''}`}>{r}</button>)}
        </div>
        <input placeholder="Filter…" value={globalFilter} onChange={e => setGlobalFilter(e.target.value)}
          className="input-field" style={{ marginLeft: 'auto', width: 150, padding: '6px 10px' }} />
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--color-faint)', margin: '0 0 10px' }}>
        {fmtNumber(filtered.length)} of {fmtNumber(sites.length)} sites
      </p>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} style={{ width: h.getSize() }} onClick={h.column.getToggleSortingHandler()}>
                      <span style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', userSelect:'none' }}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === 'asc'  && <ChevronUp   size={12} style={{ color:'var(--color-primary)' }} />}
                        {h.column.getIsSorted() === 'desc' && <ChevronDown size={12} style={{ color:'var(--color-primary)' }} />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr><td colSpan={columns.length} style={{ textAlign:'center', padding:'44px 0', color:'var(--color-faint)', fontSize:'0.875rem' }}>No sites match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
