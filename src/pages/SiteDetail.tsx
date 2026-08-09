import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, ChevronLeft, AlertTriangle } from 'lucide-react'
import { getSiteDetail } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, ResidueBadge, DASBadge } from '../components/ui/Badge'
import { EvidenceBar } from '../components/ui/EvidenceBar'
import { uniprotUrl, pubmedUrl } from '../utils/format'
import type { SiteDetail as SiteDetailType, SiteConflict } from '../types'

const InfoSection = ({ title, accentColor = '#2563EB', children }: {
  title: string; accentColor?: string; children: React.ReactNode
}) => (
  <div className="card" style={{ borderTop: `3px solid ${accentColor}`, marginBottom: 16 }}>
    <div style={{ padding: '18px 22px' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: accentColor, marginBottom: 14 }}>
        {title}
      </p>
      {children}
    </div>
  </div>
)

const KV = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0',
                borderBottom: '1px solid var(--color-bg)', fontSize: '0.8125rem' }}>
    <span style={{ width: 160, flexShrink: 0, color: 'var(--color-muted)', fontSize: '0.78rem' }}>{label}</span>
    <span style={{ color: 'var(--color-text)' }}>{value}</span>
  </div>
)

export const SiteDetail = () => {
  const { uniprotId, res, pos } = useParams<{ uniprotId: string; res: string; pos: string }>()
  const [detail,  setDetail]  = useState<SiteDetailType | null>(null)
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
  if (error)   return <div style={{ maxWidth: 600, padding: 32 }}><ErrorBox message={error} /></div>
  if (!detail) return null

  const site      = detail.site
  const pmids: number[] = detail.site.pmids ?? []
  const conflicts       = detail.conflicts ?? []

  return (
    <div style={{ maxWidth: 820, padding: '28px 32px' }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem',
                    color: 'var(--color-muted)', marginBottom: 20 }}>
        <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to={`/protein/${uniprotId}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{uniprotId}</Link>
        <span>/</span>
        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{res}{pos}</span>
      </nav>

      {/* Title card */}
      <div className="card card-accent-blue" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem' }}>
              {res}{pos} · {uniprotId}
            </h1>
            {detail.protein?.protein_name && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: 4 }}>
                {detail.protein.protein_name}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ResidueBadge type={site.residue_type} />
            <TierBadge tier={site.evidence_tier} />
            <DASBadge das={site.das_score} />
          </div>
        </div>
      </div>

      {/* Evidence summary */}
      <InfoSection title="Evidence Summary" accentColor="#2563EB">
        <KV label="Database Agreement" value={<span style={{ fontWeight: 600 }}>{site.das_score} / 3 databases</span>} />
        <KV label="Publication Depth"  value={<span>{site.pds_score} unique publication{site.pds_score !== 1 ? 's' : ''}</span>} />
        <KV label="Confidence Score"   value={typeof site.confidence === 'number' ? site.confidence.toFixed(3) : '—'} />
        <KV label="Source Databases"   value={<EvidenceBar sources={site.sources ?? []} pds={site.pds_score} />} />
        <KV label="UniProt"            value={
          <a href={uniprotUrl(uniprotId!)} target="_blank" rel="noreferrer"
             style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', textDecoration: 'none' }}>
            {uniprotId} <ExternalLink size={12} />
          </a>
        } />
      </InfoSection>

      {/* PMIDs */}
      {pmids.length > 0 && (
        <InfoSection title={`Supporting Publications (${pmids.length})`} accentColor="#059669">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {pmids.map(pmid => (
              <a key={pmid} href={pubmedUrl(pmid)} target="_blank" rel="noreferrer"
                 className="source-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '4px 10px', fontSize: '0.75rem', borderRadius: 6 }}>
                PMID: {pmid} <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </InfoSection>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <InfoSection title={`Nearby Position Conflicts (${conflicts.length})`} accentColor="#d97706">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.78rem',
                        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
                        padding: '10px 14px', marginBottom: 12, color: '#92400e' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Sites within ±5 residues may represent the same phosphorylation event at slightly different positions.</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>DAS</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map((c: SiteConflict) => {
                const otherPos = c.pos_a === Number(pos) ? c.pos_b : c.pos_a
                return (
                  <tr key={c.conflict_id}>
                    <td>
                      <Link to={`/site/${uniprotId}/${c.residue_type}/${otherPos}`}
                        style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        {c.residue_type}{otherPos}
                      </Link>
                    </td>
                    <td><DASBadge das={c.das_a} /></td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>±{c.distance}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </InfoSection>
      )}

      {/* Back link */}
      <Link to={`/protein/${uniprotId}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem',
                 color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
        <ChevronLeft size={15} /> Back to {uniprotId}
      </Link>
    </div>
  )
}
