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

const TIERS    = ['ALL', 'GOLD', 'SILVER', 'BRONZE'] as const
const RESIDUES = ['ALL', 'S', 'T', 'Y'] as const

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
      .then(r => {
        if (cancelled) return
        setProtein(r.protein); setSites(r.sites); setLoading(false)
      })
      .catch(() => {
        searchProteins(uniprotId, undefined, 25)
          .then(results => {
            if (cancelled) return
            if (results.length > 0) navigate(`/protein/${results[0].uniprot_id}`, { replace: true })
            else { setError(`No protein found for "${uniprotId}". Try a UniProt accession (e.g. P04637).`); setLoading(false) }
          })
          .catch(() => {
            if (cancelled) return
            setError(`No protein found for "${uniprotId}". Try a UniProt accession (e.g. P04637).`)
            setLoading(false)
          })
      })
    return () => { cancelled = true }
  }, [uniprotId, navigate])

  const filtered = useMemo(() => sites.filter(s => {
    if (tierFilter !== 'ALL' && s.evidence_tier !== tierFilter) return false
    if (resFilter  !== 'ALL' && s.residue_type  !== resFilter)  return false
    return true
  }), [sites, tierFilter, resFilter])

  const columns = useMemo<ColumnDef<PhosphoSite>[]>(() => [
    { accessorKey: 'residue_type',  header: 'Res',      size: 55,  cell: ({ getValue }) => <ResidueBadge type={getValue<string>()} /> },
    {
      accessorKey: 'position', header: 'Position', size: 85,
      cell: ({ getValue }) => (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
          {getValue<number>()}
        </span>
      ),
    },
    { accessorKey: 'evidence_tier', header: 'Tier',     size: 80,  cell: ({ getValue }) => <TierBadge tier={getValue<string>()} /> },
    { accessorKey: 'das_score',     header: 'DAS',      size: 70,  cell: ({ getValue }) => <DASBadge das={getValue<number>()} /> },
    { accessorKey: 'pds_score',     header: 'PDS',      size: 60,  cell: ({ getValue }) => <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{getValue<number>()}</span> },
    { id: 'sources', header: 'Evidence', cell: ({ row }) => <EvidenceBar sources={row.original.sources ?? []} pds={row.original.pds_score} /> },
    {
      id: 'link', header: '', size: 60,
      cell: ({ row }) => (
        <Link to={`/site/${uniprotId}/${row.original.residue_type}/${row.original.position}`}
          style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          View →
        </Link>
      ),
    },
  ], [uniprotId])

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (loading) return <LoadingSpinner label={`Loading ${uniprotId}...`} />
  if (error)   return <div style={{ maxWidth: 600, padding: 32 }}><ErrorBox message={error} /></div>
  if (!protein) return null

  const tierCounts = { GOLD: 0, SILVER: 0, BRONZE: 0 } as Record<string, number>
  sites.forEach(s => { tierCounts[s.evidence_tier] = (tierCounts[s.evidence_tier] ?? 0) + 1 })

  const tierMeta: Record<string, { color: string; bg: string; border: string }> = {
    GOLD:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    SILVER: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    BRONZE: { color: '#b45309', bg: '#fefce8', border: '#fef08a' },
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>

      {/* Protein header */}
      <div className="card card-accent-blue" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 46, width: 46, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#fff',
            }}>
              <Dna size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {protein.gene_name ?? uniprotId}
                </h1>
                <a href={uniprotUrl(protein.uniprot_id)} target="_blank" rel="noreferrer"
                   style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem',
                            fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none',
                            background: 'var(--color-bg)', padding: '2px 8px', borderRadius: 99,
                            border: '1px solid var(--color-border-blue)' }}>
                  {protein.uniprot_id} <ExternalLink size={11} />
                </a>
              </div>
              {protein.protein_name && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: 2 }}>{protein.protein_name}</p>
              )}
              {protein.organism && (
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>{protein.organism}</p>
              )}
              {protein.sequence_length && (
                <p style={{ marginTop: 6, fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace", color: '#94a3b8' }}>
                  {fmtNumber(protein.sequence_length)} aa
                </p>
              )}
            </div>
          </div>

          {/* Tier counts */}
          <div style={{ display: 'flex', gap: 10 }}>
            {(['GOLD', 'SILVER', 'BRONZE'] as const).map(t => (
              <div key={t} style={{
                background: tierMeta[t].bg, border: `1px solid ${tierMeta[t].border}`,
                borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 68,
              }}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.1rem', fontWeight: 800, color: tierMeta[t].color }}>
                  {fmtNumber(tierCounts[t] ?? 0)}
                </p>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: tierMeta[t].color, opacity: 0.7, marginTop: 2 }}>
                  {t}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TIERS.map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`pill ${tierFilter === t ? 'pill-active' : ''}`}>{t}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--color-border-blue)' }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {RESIDUES.map(r => (
            <button key={r} onClick={() => setResFilter(r)}
              className={`pill ${resFilter === r ? 'pill-active' : ''}`}>{r}</button>
          ))}
        </div>
        <input
          placeholder="Filter…" value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="input-field" style={{ marginLeft: 'auto', width: 160 }}
        />
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: 10 }}>
        Showing {fmtNumber(filtered.length)} of {fmtNumber(sites.length)} sites
      </p>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} style={{ width: h.getSize() }} onClick={h.column.getToggleSortingHandler()}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none' }}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === 'asc'  && <ChevronUp size={12} />}
                        {h.column.getIsSorted() === 'desc' && <ChevronDown size={12} />}
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
                <tr>
                  <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                    No sites match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
