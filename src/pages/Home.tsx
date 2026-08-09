import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Database, Layers, Award, FileText, Zap, ArrowRight } from 'lucide-react'
import { getStats, getDASDistribution, getSpeciesBreakdown } from '../api/client'
import { TierPieChart, DASBarChart, SpeciesBarChart } from '../components/charts/StatsCharts'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { DBStats, DASEntry } from '../types'
import { fmtNumber } from '../utils/format'

const FEATURES = [
  {
    icon: <Database size={18} />,
    color: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
    title: 'Multi-Database Consensus',
    desc: 'Sites aggregated from PhosphoSitePlus, Phospho.ELM, PTMS, DbPAF, SysPTM and more.',
  },
  {
    icon: <Award size={18} />,
    color: 'linear-gradient(135deg,#d97706,#b45309)',
    title: 'Evidence Tier System',
    desc: 'GOLD / SILVER / BRONZE tiers scored by Database Agreement (DAS) and publication depth (PDS).',
  },
  {
    icon: <Zap size={18} />,
    color: 'linear-gradient(135deg,#7c3aed,#DB2777)',
    title: 'ML Prediction',
    desc: 'ESM-2 (650M) embeddings power PhosConsensus-Predict MLP — AUC-ROC 0.893 on held-out test.',
  },
  {
    icon: <FileText size={18} />,
    color: 'linear-gradient(135deg,#059669,#0d9488)',
    title: 'Batch Annotation',
    desc: 'Upload up to 5,000 sites in one request. Get KNOWN / NOVEL labels with full evidence metadata.',
  },
]

const QUICKLINKS = [
  { to: '/browse', label: 'Browse Sites',       sub: 'Filter by tier, DAS, residue, or species', icon: <Layers size={18} /> },
  { to: '/batch',  label: 'Batch Annotator',    sub: 'Upload a list of sites for bulk lookup',    icon: <FileText size={18} /> },
  { to: '/about',  label: 'Methods & Citation', sub: 'Scoring pipeline and how to cite PhosNet',  icon: <Database size={18} /> },
]

export const Home = () => {
  const [stats,       setStats]       = useState<DBStats | null>(null)
  const [dasData,     setDasData]     = useState<DASEntry[]>([])
  const [speciesData, setSpeciesData] = useState<{ organism: string; unique_sites: number }[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getDASDistribution(), getSpeciesBreakdown()])
      .then(([s, d, sp]) => { setStats(s); setDasData(d); setSpeciesData(sp) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>

      {/* ── Banner ────────────────────────────────────────────────────── */}
      <img src="/banner.png" alt="PhosNet"
           style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border-light)', padding: '24px 32px 20px' }}>
        <h1 className="page-title" style={{ fontSize: '1.6rem' }}>
          Phosphorylation Meta-Database
        </h1>
        <p className="page-subtitle">
          A consensus-scored integration of 300,038 sites from 5 major databases with ML-guided novel site rescue.
        </p>
      </div>

      {/* ── Live stats strip ──────────────────────────────────────────── */}
      {stats && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border-light)', padding: '16px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', maxWidth: 640 }}>
            {[
              { label: 'Total Sites',      value: fmtNumber(stats.total_sites) },
              { label: 'Unique Proteins',   value: fmtNumber(stats.total_proteins) },
              { label: 'GOLD Sites',        value: fmtNumber(stats.gold_sites) },
              { label: 'Species',           value: fmtNumber(Object.keys(stats.species_breakdown).length) },
            ].map(s => (
              <div key={s.label} className="stat-box">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

        {/* ── Charts ────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSpinner label="Loading statistics…" />
        ) : stats ? (
          <div style={{ marginBottom: 32 }}>
            <p className="section-title" style={{ marginBottom: 12 }}>Database Overview</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { title: 'Evidence Tier Distribution', el: <TierPieChart stats={stats} /> },
                { title: 'DAS Score Distribution',     el: <DASBarChart data={dasData} /> },
                { title: 'Top Species',                el: <SpeciesBarChart data={speciesData} /> },
              ].map(c => (
                <div key={c.title} className="card" style={{ padding: '18px 20px' }}>
                  <p className="section-title" style={{ marginBottom: 14 }}>{c.title}</p>
                  {c.el}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Feature cards ────────────────────────────────────────── */}
        <p className="section-title" style={{ marginBottom: 12 }}>Core Features</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card-hover" style={{ padding: '18px 18px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                height: 38, width: 38, borderRadius: 10,
                background: f.color, color: '#fff', marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)', marginBottom: 6 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.55 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Quick nav ─────────────────────────────────────────────── */}
        <p className="section-title" style={{ marginBottom: 12 }}>Get Started</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {QUICKLINKS.map(q => (
            <Link key={q.to} to={q.to}
              className="card-hover"
              style={{ padding: '16px 18px', textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 36, width: 36, borderRadius: 8,
                background: 'var(--color-bg)', color: 'var(--color-primary)',
                flexShrink: 0,
              }}>
                {q.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {q.label}
                  <ArrowRight size={13} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 3, lineHeight: 1.45 }}>
                  {q.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
