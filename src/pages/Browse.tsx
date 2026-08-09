import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender,
  type ColumnDef, type SortingState,
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
    getTopSites({
      limit: pageSize,
      offset: pageIndex * pageSize,
      ...(tierFilter !== 'ALL' && { evidence_tier: tierFilter }),
    })
      .then(data => { setSites(data.sites); setTotal(data.total) })
      .catch(() => setError('Failed to load sites.'))
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
      accessorKey: 'uniprot_id',
      header: 'UniProt',
      cell: ({ getValue }) => (
        <Link to={`/protein/${getValue<string>()}`}
          style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                   color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.8rem' }}>
          {getValue<string>()}
        </Link>
      ),
    },
    { accessorKey: 'gene_name',      header: 'Gene',     cell: ({ getValue }) => getValue<string>() ?? '—' },
    { accessorKey: 'residue_type',   header: 'Res',      cell: ({ getValue }) => <ResidueBadge type={getValue<string>()} /> },
    { accessorKey: 'position',       header: 'Position' },
    { accessorKey: 'evidence_tier',  header: 'Tier',     cell: ({ getValue }) => <TierBadge tier={getValue<string>()} /> },
    { accessorKey: 'das_score',      header: 'DAS',      cell: ({ getValue }) => <DASBadge das={getValue<number>()} /> },
    { accessorKey: 'pds_score',      header: 'PDS' },
    {
      id: 'evidence', header: 'Sources',
      cell: ({ row }) => <EvidenceBar sources={row.original.sources ?? []} pds={row.original.pds_score} />,
    },
    {
      id: 'detail', header: '',
      cell: ({ row }) => (
        <Link to={`/site/${row.original.uniprot_id}/${row.original.residue_type}/${row.original.position}`}
          style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          View →
        </Link>
      ),
    },
  ], [])

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Browse Phosphorylation Sites</h1>
        <p className="page-subtitle">
          Showing top sites by Database Agreement Score. Use filters to narrow results.
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              placeholder="UniProt ID or gene…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 28, width: 200 }}
            />
          </div>

          {/* Tier pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {TIERS.map(t => (
              <button key={t} onClick={() => setTierFilter(t)}
                className={`pill ${tierFilter === t ? 'pill-active' : ''}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Residue pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {RESIDUES.map(r => (
              <button key={r} onClick={() => setResFilter(r)}
                className={`pill ${resFilter === r ? 'pill-active' : ''}`}>
                {r}
              </button>
            ))}
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="input-field"
            style={{ marginLeft: 'auto', width: 'auto', paddingRight: 10 }}
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading sites…" /> : error ? (
        <ErrorBox message={error} />
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 8 }}>
            {total.toLocaleString()} total sites · page {pageIndex + 1} of {pageCount}
            {filtered.length < sites.length && ` · ${filtered.length} shown after filters`}
          </p>

          {/* Table */}
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
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => setPageIndex(i => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={15} /> Prev
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              Page {pageIndex + 1} / {pageCount}
            </span>
            <button onClick={() => setPageIndex(i => Math.min(pageCount - 1, i + 1))}
              disabled={pageIndex >= pageCount - 1}
              className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
