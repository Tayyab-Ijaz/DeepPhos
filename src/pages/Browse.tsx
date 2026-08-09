import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getTopSites } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, ResidueBadge, DASBadge } from '../components/ui/Badge'
import { EvidenceBar } from '../components/ui/EvidenceBar'
import type { PhosphoSite } from '../types'

const PAGE_SIZES = [25, 50, 100]
const TIERS    = ['ALL', 'GOLD', 'SILVER', 'BRONZE']
const RESIDUES = ['ALL', 'S', 'T', 'Y']

export const Browse = () => {
  const [sites,      setSites]      = useState<PhosphoSite[]>([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [sorting,    setSorting]    = useState<SortingState>([{ id: 'das_score', desc: true }])
  const [tierFilter, setTierFilter] = useState('ALL')
  const [resFilter,  setResFilter]  = useState('ALL')
  const [search,     setSearch]     = useState('')
  const [pageSize,   setPageSize]   = useState(50)
  const [pageIndex,  setPageIndex]  = useState(0)

  const fetchPage = useCallback(() => {
    setLoading(true); setError('')
    getTopSites({ limit: pageSize, offset: pageIndex * pageSize, ...(tierFilter !== 'ALL' && { evidence_tier: tierFilter }) })
      .then(d => { setSites(d.sites); setTotal(d.total) })
      .catch(() => setError('Failed to load sites. Is the API running?'))
      .finally(() => setLoading(false))
  }, [pageSize, pageIndex, tierFilter])

  useEffect(() => { fetchPage() }, [fetchPage])
  useEffect(() => { setPageIndex(0) }, [tierFilter, pageSize])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const filtered = useMemo(() => sites.filter(s => {
    if (resFilter !== 'ALL' && s.residue_type !== resFilter) return false
    if (search && !s.uniprot_id.toLowerCase().includes(search.toLowerCase())
               && !(s.gene_name ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [sites, resFilter, search])

  const columns = useMemo<ColumnDef<PhosphoSite>[]>(() => [
    {
      accessorKey: 'uniprot_id', header: 'UniProt',
      cell: ({ getValue }) => (
        <Link to={`/protein/${getValue<string>()}`}
          style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
                   fontSize: '0.78rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
          {getValue<string>()}
        </Link>
      ),
    },
    { accessorKey: 'gene_name',     header: 'Gene',     cell: ({ getValue }) => <span style={{ fontWeight: 600 }}>{getValue<string>() ?? '—'}</span> },
    { accessorKey: 'residue_type',  header: 'Res',      cell: ({ getValue }) => <ResidueBadge type={getValue<string>()} /> },
    { accessorKey: 'position',      header: 'Position', cell: ({ getValue }) => <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}>{getValue<number>()}</span> },
    { accessorKey: 'evidence_tier', header: 'Tier',     cell: ({ getValue }) => <TierBadge tier={getValue<string>()} /> },
    { accessorKey: 'das_score',     header: 'DAS',      cell: ({ getValue }) => <DASBadge das={getValue<number>()} /> },
    { accessorKey: 'pds_score',     header: 'PDS',      cell: ({ getValue }) => <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--color-muted)' }}>{getValue<number>()}</span> },
    { id: 'sources', header: 'Evidence', cell: ({ row }) => <EvidenceBar sources={row.original.sources ?? []} pds={row.original.pds_score} /> },
    {
      id: 'detail', header: '',
      cell: ({ row }) => (
        <Link to={`/site/${row.original.uniprot_id}/${row.original.residue_type}/${row.original.position}`}
          style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          View →
        </Link>
      ),
    },
  ], [])

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="page-wrap">

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">
          <span className="gradient-text">Browse</span>
          <span style={{ color: 'var(--color-text)' }}> Phosphorylation Sites</span>
        </h1>
        <span className="page-subtitle">
          {total > 0 ? `${total.toLocaleString()} sites` : 'Phosphorylation sites'} sorted by Database Agreement Score · use filters to narrow
        </span>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-faint)', pointerEvents: 'none' }} />
          <input placeholder="UniProt ID or gene…" value={search} onChange={e => setSearch(e.target.value)}
            className="input-field" style={{ paddingLeft: 28, width: 190, padding: '7px 10px 7px 28px' }} />
        </div>

        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span className="section-label" style={{ margin: 0, marginRight: 2 }}>Tier:</span>
          {TIERS.map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`pill ${tierFilter === t ? 'pill-active' : ''}`}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span className="section-label" style={{ margin: 0, marginRight: 2 }}>Res:</span>
          {RESIDUES.map(r => (
            <button key={r} onClick={() => setResFilter(r)}
              className={`pill ${resFilter === r ? 'pill-active' : ''}`}>{r}</button>
          ))}
        </div>

        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
          className="input-field"
          style={{ marginLeft: 'auto', width: 'auto', flexShrink: 0 }}>
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner label="Loading sites…" /> : error ? (
        <ErrorBox message={error} />
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-faint)', marginBottom: 10 }}>
            {total.toLocaleString()} total sites
            {filtered.length < sites.length && ` · ${filtered.length} shown after filters`}
            {' '}· page {pageIndex + 1} of {pageCount}
          </p>

          <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} onClick={h.column.getToggleSortingHandler()}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none' }}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getIsSorted() === 'asc'  && <ChevronUp size={12}   style={{ color: 'var(--color-primary)' }} />}
                            {h.column.getIsSorted() === 'desc' && <ChevronDown size={12} style={{ color: 'var(--color-primary)' }} />}
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
                    <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-faint)' }}>No sites match the filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => setPageIndex(i => Math.max(0, i - 1))} disabled={pageIndex === 0} className="btn-ghost">
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: 500 }}>
              Page {pageIndex + 1} / {pageCount}
            </span>
            <button onClick={() => setPageIndex(i => Math.min(pageCount - 1, i + 1))} disabled={pageIndex >= pageCount - 1} className="btn-ghost">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
