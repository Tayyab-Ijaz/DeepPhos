import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, ChevronLeft, AlertTriangle } from 'lucide-react'
import { getSiteDetail } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, ResidueBadge, DASBadge } from '../components/ui/Badge'
import { EvidenceBar } from '../components/ui/EvidenceBar'
import { uniprotUrl, pubmedUrl } from '../utils/format'
import type { SiteDetail as SiteDetailType, SiteConflict } from '../types'
import type { ReactNode } from 'react'

const InfoSection = ({ title, color = '#2563EB', children }: { title: string; color?: string; children: ReactNode }) => (
  <div className="card" style={{ borderTop: `3px solid ${color}`, marginBottom: 16 }}>
    <div style={{ padding: '18px 22px' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color, margin: '0 0 14px' }}>
        {title}
      </p>
      {children}
    </div>
  </div>
)

const KV = ({ label, value }: { label: string; value: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--color-bg)', fontSize: '0.8125rem' }}>
    <span style={{ width: 168, flexShrink: 0, color: 'var(--color-muted)', fontSize: '0.78rem', paddingTop: 1 }}>{label}</span>
    <span style={{ color: 'var(--color-text)', flex: 1 }}>{value}</span>
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
  if (error)   return <div className="page-wrap" style={{ maxWidth: 640, margin: '0 auto' }}><ErrorBox message={error} /></div>
  if (!detail) return null

  const { site, conflicts = [] } = detail
  const pmids: number[] = site.pmids ?? []

  return (
    <div className="page-wrap" style={{ maxWidth: 840, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-faint)', marginBottom: 18 }}>
        <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
        <span>/</span>
        <Link to={`/protein/${uniprotId}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>{uniprotId}</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{res}{pos}</span>
      </nav>

      {/* Title */}
      <div className="card-blue" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 800 }}>
              <span className="gradient-text">{res}{pos}</span>
              <span style={{ color: 'var(--color-text)', fontWeight: 700 }}> · {uniprotId}</span>
            </h1>
            {detail.protein?.protein_name && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>{detail.protein.protein_name}</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ResidueBadge type={site.residue_type} />
            <TierBadge tier={site.evidence_tier} />
            <DASBadge das={site.das_score} />
          </div>
        </div>
      </div>

      {/* Evidence summary */}
      <InfoSection title="Evidence Summary" color="#2563EB">
        <KV label="Database Agreement" value={<span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{site.das_score} / 3 databases confirmed</span>} />
        <KV label="Publication Depth"  value={<span>{site.pds_score} unique publication{site.pds_score !== 1 ? 's' : ''}</span>} />
        <KV label="Confidence Score"   value={<span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'var(--color-primary)' }}>{typeof site.confidence === 'number' ? site.confidence.toFixed(3) : '—'}</span>} />
        <KV label="Source Databases"   value={<EvidenceBar sources={site.sources ?? []} pds={site.pds_score} />} />
        <KV label="UniProt"            value={
          <a href={uniprotUrl(uniprotId!)} target="_blank" rel="noreferrer"
             style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--color-primary)', textDecoration:'none', fontWeight:600 }}>
            {uniprotId} <ExternalLink size={12} />
          </a>
        } />
      </InfoSection>

      {/* PMIDs */}
      {pmids.length > 0 && (
        <InfoSection title={`Supporting Publications (${pmids.length})`} color="#059669">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {pmids.map(pmid => (
              <a key={pmid} href={pubmedUrl(pmid)} target="_blank" rel="noreferrer"
                 style={{ display:'inline-flex', alignItems:'center', gap:4,
                          background:'var(--color-bg-light)', border:'1px solid var(--color-border-blue)',
                          color:'var(--color-primary)', borderRadius:6, padding:'4px 10px',
                          fontSize:'0.75rem', fontWeight:600, textDecoration:'none',
                          fontFamily:"'JetBrains Mono',monospace" }}>
                PMID: {pmid} <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </InfoSection>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <InfoSection title={`Nearby Position Conflicts (${conflicts.length})`} color="#d97706">
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:'0.8rem', color:'#92400e' }}>
            <AlertTriangle size={15} style={{ flexShrink:0, marginTop:1 }} />
            Sites within ±5 residues may represent the same phosphorylation event at slightly different isoform positions.
          </div>
          <table className="data-table">
            <thead><tr><th>Site</th><th>DAS</th><th>Distance</th></tr></thead>
            <tbody>
              {conflicts.map((c: SiteConflict) => {
                const otherPos = c.pos_a === Number(pos) ? c.pos_b : c.pos_a
                return (
                  <tr key={c.conflict_id}>
                    <td>
                      <Link to={`/site/${uniprotId}/${c.residue_type}/${otherPos}`}
                        style={{ color:'var(--color-primary)', textDecoration:'none', fontWeight:700 }}>
                        {c.residue_type}{otherPos}
                      </Link>
                    </td>
                    <td><DASBadge das={c.das_a} /></td>
                    <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem', color:'var(--color-muted)' }}>±{c.distance}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </InfoSection>
      )}

      <Link to={`/protein/${uniprotId}`}
        style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'0.8125rem', color:'var(--color-primary)', textDecoration:'none', fontWeight:600 }}>
        <ChevronLeft size={15} /> Back to {uniprotId}
      </Link>
    </div>
  )
}
