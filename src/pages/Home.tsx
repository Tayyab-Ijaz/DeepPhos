import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Database, Layers, Award, FileText, Zap, ArrowRight, Search } from 'lucide-react'
import { getStats, getDASDistribution, getSpeciesBreakdown } from '../api/client'
import { TierPieChart, DASBarChart, SpeciesBarChart } from '../components/charts/StatsCharts'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { DBStats, DASEntry } from '../types'
import { fmtNumber } from '../utils/format'

const FEATURES = [
  {
    icon: <Database size={20} />,
    gradient: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
    title: 'Multi-Database Consensus',
    desc: 'Sites aggregated from PhosphoSitePlus, Phospho.ELM, PTMS, DbPAF, and SysPTM into one scored catalogue.',
  },
  {
    icon: <Award size={20} />,
    gradient: 'linear-gradient(135deg,#d97706,#b45309)',
    title: 'Evidence Tier System',
    desc: 'GOLD / SILVER / BRONZE classification using Database Agreement Score (DAS) and Publication Depth Score (PDS).',
  },
  {
    icon: <Zap size={20} />,
    gradient: 'linear-gradient(135deg,#7c3aed,#DB2777)',
    title: 'ML Prediction',
    desc: 'ESM-2 (650M) residue embeddings power PhosConsensus-Predict — AUC-ROC 0.893 on held-out human test set.',
  },
  {
    icon: <FileText size={20} />,
    gradient: 'linear-gradient(135deg,#059669,#0d9488)',
    title: 'Batch Annotation',
    desc: 'Submit up to 5,000 sites per request. Instant KNOWN / NOVEL / NOT_FOUND labels with full evidence context.',
  },
]

const QUICKLINKS = [
  { to: '/browse', icon: <Layers size={17} />,   label: 'Browse Sites',       sub: 'Filter by tier, DAS score, residue type, or species' },
  { to: '/batch',  icon: <FileText size={17} />,  label: 'Batch Annotator',    sub: 'Upload a list of sites for rapid bulk annotation'       },
  { to: '/about',  icon: <Database size={17} />,  label: 'Methods & Citation', sub: 'Scoring pipeline, flowchart, and how to cite PhosNet'    },
]

export const Home = () => {
  const navigate  = useNavigate()
  const [query,   setQuery]   = useState('')
  const [stats,   setStats]   = useState<DBStats | null>(null)
  const [dasData, setDasData] = useState<DASEntry[]>([])
  const [species, setSpecies] = useState<{ organism: string; unique_sites: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [apiDown, setApiDown] = useState(false)

  useEffect(() => {
    Promise.all([getStats(), getDASDistribution(), getSpeciesBreakdown()])
      .then(([s, d, sp]) => { setStats(s); setDasData(d); setSpecies(sp) })
      .catch(() => setApiDown(true))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim().toUpperCase()
    if (q) { navigate(`/protein/${q}`); setQuery('') }
  }

  return (
    <div>

      {/* ── Banner ────────────────────────────────────────────────────── */}
      <img
        src="/banner.png"
        alt="PhosNet — Phosphorylation Meta-Database"
        style={{ width: '100%', maxHeight: 168, objectFit: 'cover', display: 'block' }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1.5px solid var(--color-border-light)', padding: '32px 30px 28px', textAlign: 'center' }}>
        <h1 className="page-title" style={{ justifyContent: 'center' }}>
          <span className="gradient-text">Phosphorylation</span>
          <span style={{ color: 'var(--color-text)' }}> Meta-Database</span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: 10, marginBottom: 22, lineHeight: 1.55 }}>
          300,038 consensus-scored sites from 5 databases · ESM-2 ML prediction · FastAPI REST service
        </p>

        {/* Search bar — centred, constrained width */}
        <form onSubmit={handleSearch}
              style={{ display: 'flex', gap: 8, maxWidth: 540, margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-faint)', pointerEvents: 'none',
            }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search UniProt ID or gene name (e.g. P04637, TP53)"
              className="input-field"
              style={{ paddingLeft: 32, paddingRight: 12 }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
            Search
          </button>
        </form>
      </div>

      <div className="page-wrap" style={{ paddingBottom: 0, paddingTop: 22 }}>

        {/* Stat boxes */}
        {stats ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            {[
              { label: 'Total Sites',    value: fmtNumber(stats.total_sites)     },
              { label: 'Proteins',       value: fmtNumber(stats.total_proteins)  },
              { label: 'GOLD Sites',     value: fmtNumber(stats.gold_sites)      },
              { label: 'Species',        value: `≥${Object.keys(stats.species_breakdown).length}` },
              { label: 'PMIDs',          value: '47'                             },
              { label: 'AUC-ROC (ML)',   value: '0.893'                          },
            ].map(s => (
              <div key={s.label} className="stat-box" style={{ minWidth: 100, flex: '1 1 100px' }}>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div style={{ marginBottom: 28 }}>
            <LoadingSpinner label="Loading statistics…" />
          </div>
        ) : null}

        {/* Charts */}
        {!loading && stats && !apiDown && (
          <div style={{ marginBottom: 28 }}>
            <p className="section-label">Database Overview</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { title: 'Evidence Tier Distribution', el: <TierPieChart stats={stats} />   },
                { title: 'DAS Score Distribution',     el: <DASBarChart  data={dasData} /> },
                { title: 'Top Species by Sites',       el: <SpeciesBarChart data={species} /> },
              ].map(c => (
                <div key={c.title} className="card" style={{ padding: '16px 18px' }}>
                  <p className="section-label" style={{ marginBottom: 12 }}>{c.title}</p>
                  {c.el}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature cards */}
        <div style={{ marginBottom: 28 }}>
          <p className="section-label">Core Features</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card-hover" style={{ padding: '18px 20px', display: 'flex', gap: 14 }}>
                <div style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 40, width: 40, borderRadius: 10, background: f.gradient, color: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {f.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 5, marginTop: 0 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.55, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ marginBottom: 28 }}>
          <p className="section-label">Get Started</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {QUICKLINKS.map(q => (
              <Link key={q.to} to={q.to} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 34, width: 34, borderRadius: 8, background: 'var(--color-bg)',
                    color: 'var(--color-primary)', border: '1px solid var(--color-border-blue)',
                  }}>
                    {q.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)',
                      display: 'flex', alignItems: 'center', gap: 5, margin: 0, marginBottom: 4,
                    }}>
                      {q.label}
                      <ArrowRight size={13} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.45 }}>
                      {q.sub}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
