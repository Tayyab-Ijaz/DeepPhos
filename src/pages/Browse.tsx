import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTopSites } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, ResidueBadge, DASBadge } from '../components/ui/Badge'
import { EvidenceBar } from '../components/ui/EvidenceBar'
import type { PhosphoSite } from '../types'

const PAGE_SIZES = [25, 50, 100]
const TIERS = ['ALL', 'GOLD', 'SILVER', 'BRONZE']
const RESIDUES = ['ALL', 'S', 'T', 'Y']

export const Browse = () => {
  const [sites,   setSites]   = useState<PhosphoSite[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'das_score', desc: true }])
  const [tierFilter, setTierFilter] = useState('ALL')
  const [resFilter,  setResFilter]  = useState('ALL')
  const [search, setSearch] = useState('')
  const [pageSize,  setPageSize]  = useState(50)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchPage = useCallback(() => {
    setLoading(true)
    setError('')
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

  // Reset to page 0 when filters change
  useEffect(() => { setPageIndex(0) }, [tierFilter, pageSize])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // Client-side filtering for residue type and search (lightweight on the page)
  const filtered = useMemo(() => sites.filter(s => {
    if (resFilter  !== 'ALL' && s.residue_type  !== resFilter)  return false
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
          className="font-medium text-brand-600 hover:underline">
          {getValue<string>()}
        </Link>
      ),
    },
    {
      accessorKey: 'gene_name',
      header: 'Gene',
      cell: ({ getValue }) => getValue<string>() ?? '—',
    },
    {
      accessorKey: 'residue_type',
      header: 'Res',
      cell: ({ getValue }) => <ResidueBadge type={getValue<string>()} />,
    },
    {
      accessorKey: 'position',
      header: 'Position',
    },
    {
      accessorKey: 'evidence_tier',
      header: 'Tier',
      cell: ({ getValue }) => <TierBadge tier={getValue<string>()} />,
    },
    {
      accessorKey: 'das_score',
      header: 'DAS',
      cell: ({ getValue }) => <DASBadge das={getValue<number>()} />,
    },
    {
      accessorKey: 'pds_score',
      header: 'PDS',
    },
    {
      id: 'evidence',
      header: 'Sources',
      cell: ({ row }) => (
        <EvidenceBar
          sources={row.original.sources ?? []}
          pds={row.original.pds_score}
        />
      ),
    },
    {
      id: 'detail',
      header: '',
      cell: ({ row }) => (
        <Link
          to={`/site/${row.original.uniprot_id}/${row.original.residue_type}/${row.original.position}`}
          className="text-xs text-brand-600 hover:underline whitespace-nowrap"
        >
          View →
        </Link>
      ),
    },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Phosphorylation Sites</h1>
        <p className="text-sm text-gray-500 mt-1">
          Showing top sites by Database Agreement Score. Use filters to narrow results.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          placeholder="Search UniProt ID or gene…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm
                     focus:outline-none focus:border-brand-400 bg-white w-56"
        />
        <div className="flex gap-1">
          {TIERS.map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${tierFilter === t
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {RESIDUES.map(r => (
            <button key={r} onClick={() => setResFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${resFilter === r
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
              {r}
            </button>
          ))}
        </div>

        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="ml-auto border border-gray-200 rounded-lg px-2 py-1.5 text-sm
                     focus:outline-none focus:border-brand-400 bg-white"
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner label="Loading sites…" /> : error ? (
        <ErrorBox message={error} />
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {total.toLocaleString()} total sites · page {pageIndex + 1} of {pageCount}
            {filtered.length < sites.length && ` · ${filtered.length} shown after local filters`}
          </p>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          <span className="flex items-center gap-1 cursor-pointer select-none">
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getIsSorted() === 'asc'  && <ChevronUp className="h-3 w-3" />}
                            {h.column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3" />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <button
              onClick={() => setPageIndex(i => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg
                         disabled:opacity-40 hover:border-brand-400 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-xs">
              Page {pageIndex + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPageIndex(i => Math.min(pageCount - 1, i + 1))}
              disabled={pageIndex >= pageCount - 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg
                         disabled:opacity-40 hover:border-brand-400 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
