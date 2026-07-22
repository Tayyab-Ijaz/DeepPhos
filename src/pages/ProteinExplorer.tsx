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

const TIERS = ['ALL', 'GOLD', 'SILVER', 'BRONZE'] as const
const RESIDUES = ['ALL', 'S', 'T', 'Y'] as const

export const ProteinExplorer = () => {
  const { uniprotId } = useParams<{ uniprotId: string }>()
  const navigate = useNavigate()
  const [protein, setProtein] = useState<ProteinInfo | null>(null)
  const [sites,   setSites]   = useState<PhosphoSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'das_score', desc: true }])
  const [tierFilter, setTierFilter]     = useState<string>('ALL')
  const [resFilter,  setResFilter]      = useState<string>('ALL')
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (!uniprotId) return
    let cancelled = false
    setLoading(true)
    setError('')
    getProteinSites(uniprotId)
      .then(r => {
        if (cancelled) return
        setProtein(r.protein)
        setSites(r.sites)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        // Direct UniProt lookup failed — try treating the query as a gene name
        searchProteins(uniprotId, undefined, 25)
          .then(results => {
            if (cancelled) return
            if (results.length > 0) {
              navigate(`/protein/${results[0].uniprot_id}`, { replace: true })
            } else {
              setError(`No protein found for "${uniprotId}". Try a UniProt accession (e.g. P04637).`)
              setLoading(false)
            }
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
    {
      accessorKey: 'residue_type',
      header: 'Res',
      size: 55,
      cell: ({ getValue }) => <ResidueBadge type={getValue<string>()} />,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      size: 85,
      cell: ({ getValue }) => <span className="font-mono text-xs font-semibold text-gray-700">{getValue<number>()}</span>,
    },
    {
      accessorKey: 'evidence_tier',
      header: 'Tier',
      size: 80,
      cell: ({ getValue }) => <TierBadge tier={getValue<string>()} />,
    },
    {
      accessorKey: 'das_score',
      header: 'DAS',
      size: 70,
      cell: ({ getValue }) => <DASBadge das={getValue<number>()} />,
    },
    {
      accessorKey: 'pds_score',
      header: 'PDS',
      size: 60,
      cell: ({ getValue }) => <span className="text-xs text-gray-600">{getValue<number>()}</span>,
    },
    {
      id: 'sources',
      header: 'Evidence',
      cell: ({ row }) => (
        <EvidenceBar sources={row.original.sources ?? []} pds={row.original.pds_score} />
      ),
    },
    {
      id: 'link',
      header: '',
      size: 60,
      cell: ({ row }) => (
        <Link
          to={`/site/${uniprotId}/${row.original.residue_type}/${row.original.position}`}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          View &rarr;
        </Link>
      ),
    },
  ], [uniprotId])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (loading) return <LoadingSpinner label={`Loading ${uniprotId}...`} />
  if (error)   return <div className="mx-auto max-w-3xl p-8"><ErrorBox message={error} /></div>
  if (!protein) return null

  const tierCounts = { GOLD: 0, SILVER: 0, BRONZE: 0 } as Record<string, number>
  sites.forEach(s => { tierCounts[s.evidence_tier] = (tierCounts[s.evidence_tier] ?? 0) + 1 })

  const tierCardColors: Record<string, string> = {
    GOLD:   'from-amber-50 to-yellow-50 border-amber-200/60 text-amber-700',
    SILVER: 'from-gray-50 to-slate-50 border-gray-200/60 text-gray-600',
    BRONZE: 'from-orange-50 to-amber-50 border-orange-200/60 text-orange-700',
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Protein header card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm shrink-0">
              <Dna className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{protein.gene_name ?? uniprotId}</h1>
                <a href={uniprotUrl(protein.uniprot_id)} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline bg-brand-50 px-2 py-0.5 rounded-full">
                  {protein.uniprot_id} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {protein.protein_name && (
                <p className="text-sm text-gray-600 mb-0.5">{protein.protein_name}</p>
              )}
              {protein.organism && (
                <p className="text-xs text-gray-400 italic">{protein.organism}</p>
              )}
              {protein.sequence_length && (
                <p className="mt-2 text-[11px] text-gray-400 font-mono">{fmtNumber(protein.sequence_length)} aa</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            {(['GOLD', 'SILVER', 'BRONZE'] as const).map(t => (
              <div key={t} className={`rounded-xl bg-gradient-to-b border px-4 py-3 text-center min-w-[72px] ${tierCardColors[t]}`}>
                <p className="text-lg font-extrabold">{fmtNumber(tierCounts[t] ?? 0)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {TIERS.map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`pill ${tierFilter === t ? 'pill-active' : 'pill-inactive'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />
        <div className="flex gap-1.5">
          {RESIDUES.map(r => (
            <button key={r} onClick={() => setResFilter(r)}
              className={`pill ${resFilter === r
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/25'
                : 'pill-inactive'}`}>
              {r}
            </button>
          ))}
        </div>
        <input
          placeholder="Filter..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="ml-auto input-field max-w-[160px] py-1.5 text-xs"
        />
      </div>

      <p className="text-[11px] text-gray-400 font-medium mb-3">
        Showing {fmtNumber(filtered.length)} of {fmtNumber(sites.length)} sites
      </p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b-2 border-gray-100">
                  {hg.headers.map(h => (
                    <th key={h.id}
                      className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      style={{ width: h.getSize() }}
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      <span className="flex items-center gap-1 cursor-pointer select-none hover:text-gray-600 transition-colors">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === 'asc'  && <ChevronUp className="h-3 w-3 text-brand-500" />}
                        {h.column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3 text-brand-500" />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-brand-50/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-gray-400 text-sm">
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
