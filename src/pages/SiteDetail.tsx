import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, ChevronLeft, AlertTriangle } from 'lucide-react'
import { getSiteDetail } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, ResidueBadge, DASBadge } from '../components/ui/Badge'
import { EvidenceBar } from '../components/ui/EvidenceBar'
import { uniprotUrl, pubmedUrl } from '../utils/format'
import type { SiteDetail as SiteDetailType, SiteConflict } from '../types'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">{title}</h2>
    {children}
  </div>
)

const KV = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
    <span className="w-40 shrink-0 text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-800">{value}</span>
  </div>
)

export const SiteDetail = () => {
  const { uniprotId, res, pos } = useParams<{ uniprotId: string; res: string; pos: string }>()
  const [detail, setDetail] = useState<SiteDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!uniprotId || !res || !pos) return
    setLoading(true)
    getSiteDetail(uniprotId, res, Number(pos))
      .then(setDetail)
      .catch(() => setError(`Site ${res}${pos} not found for ${uniprotId}.`))
      .finally(() => setLoading(false))
  }, [uniprotId, res, pos])

  if (loading) return <LoadingSpinner label="Loading site details…" />
  if (error)   return <div className="mx-auto max-w-3xl p-8"><ErrorBox message={error} /></div>
  if (!detail) return null

  const site = detail.site
  const pmids: number[] = detail.site.pmids ?? []
  const conflicts = detail.conflicts ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to={`/protein/${uniprotId}`} className="hover:text-brand-600">{uniprotId}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{res}{pos}</span>
      </nav>

      {/* Title card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {res}{pos} · {uniprotId}
            </h1>
            {detail.protein?.protein_name && (
              <p className="text-sm text-gray-500">{detail.protein.protein_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ResidueBadge type={site.residue_type} />
            <TierBadge tier={site.evidence_tier} />
            <DASBadge das={site.das_score} />
          </div>
        </div>
      </div>

      {/* Evidence */}
      <Section title="Evidence Summary">
        <KV label="Database Agreement" value={
          <span className="font-semibold">{site.das_score} / 3 databases</span>
        } />
        <KV label="Publication Depth" value={
          <span>{site.pds_score} unique publication{site.pds_score !== 1 ? 's' : ''}</span>
        } />
        <KV label="Confidence Score" value={
          typeof site.confidence === 'number'
            ? site.confidence.toFixed(3)
            : '—'
        } />
        <KV label="Source Databases" value={
          <EvidenceBar sources={site.sources ?? []} pds={site.pds_score} />
        } />
        <KV label="UniProt" value={
          <a href={uniprotUrl(uniprotId!)} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-brand-600 hover:underline">
            {uniprotId} <ExternalLink className="h-3 w-3" />
          </a>
        } />
      </Section>

      {/* PMIDs */}
      {pmids.length > 0 && (
        <Section title={`Supporting Publications (${pmids.length})`}>
          <div className="flex flex-wrap gap-2">
            {pmids.map(pmid => (
              <a key={pmid}
                href={pubmedUrl(pmid)}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700
                           border border-blue-200 rounded px-2 py-1 hover:bg-blue-100">
                PMID: {pmid} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Section title={`Nearby Position Conflicts (${conflicts.length})`}>
          <div className="mb-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50
                          border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              These sites are within ±5 residues and may represent the same phosphorylation
              event reported at slightly different positions.
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="text-left py-1 pr-4">Site</th>
                <th className="text-left py-1 pr-4">DAS</th>
                <th className="text-left py-1">Distance</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map((c: SiteConflict) => {
                const otherPos = c.pos_a === Number(pos) ? c.pos_b : c.pos_a
                return (
                <tr key={c.conflict_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4">
                    <Link
                      to={`/site/${uniprotId}/${c.residue_type}/${otherPos}`}
                      className="text-brand-600 hover:underline"
                    >
                      {c.residue_type}{otherPos}
                    </Link>
                  </td>
                  <td className="py-2 pr-4"><DASBadge das={c.das_a} /></td>
                  <td className="py-2 text-xs text-gray-500">±{c.distance}</td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* Back link */}
      <Link to={`/protein/${uniprotId}`}
        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" /> Back to {uniprotId}
      </Link>
    </div>
  )
}
