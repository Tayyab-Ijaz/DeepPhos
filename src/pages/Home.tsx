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
    icon: <Database className="h-5 w-5" />,
    color: 'from-blue-500 to-indigo-600',
    title: 'Multi-Database Consensus',
    desc: 'Sites aggregated from PhosphoSitePlus, Phospho.ELM, PTMS, DbPAF, SysPTM and more.',
  },
  {
    icon: <Award className="h-5 w-5" />,
    color: 'from-amber-500 to-orange-600',
    title: 'Evidence Tier System',
    desc: 'GOLD / SILVER / BRONZE tiers scored by Database Agreement (DAS) and publication depth (PDS).',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    color: 'from-violet-500 to-purple-600',
    title: 'ML Prediction',
    desc: 'ESM-2 embeddings + PhosConsensus-Predict MLP rescues novel sites missed by individual databases.',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    color: 'from-emerald-500 to-teal-600',
    title: 'Batch Annotation',
    desc: 'Upload up to 5,000 sites in one request. Get KNOWN / NOVEL labels with full evidence metadata.',
  },
]

const QUICKLINKS = [
  { to: '/browse', label: 'Browse All Sites',   sub: 'Filter by tier, DAS, residue, or species', icon: <Layers className="h-5 w-5" /> },
  { to: '/batch',  label: 'Batch Annotator',     sub: 'Upload a list of sites for bulk lookup',   icon: <FileText className="h-5 w-5" /> },
  { to: '/about',  label: 'Methods & Citation',  sub: 'Scoring pipeline, flowchart, and how to cite', icon: <Database className="h-5 w-5" /> },
]

export const Home = () => {
  const [stats,   setStats]   = useState<DBStats | null>(null)
  const [dasData, setDasData] = useState<DASEntry[]>([])
  const [speciesData, setSpeciesData] = useState<{ organism: string; unique_sites: number }[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([getStats(), getDASDistribution(), getSpeciesBreakdown()])
      .then(([s, d, sp]) => { setStats(s); setDasData(d); setSpeciesData(sp) })
      .catch(() => { /* stats unavailable — charts remain hidden */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-0">

      {/* ── Banner ── */}
      <div className="w-full">
        <img
          src="/banner.png"
          alt="DeepPhos — Phosphorylation Meta-Database"
          className="w-full h-auto object-cover"
          style={{ maxHeight: 200 }}
        />
      </div>

      {/* ── Hero search ── */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-7 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-[#0d2d6b]">Explore </span>
            <span className="text-emerald-600">Phosphorylation </span>
            <span className="text-[#0d2d6b]">Data</span>
          </h1>

        </div>
      </section>

      {/* ── Stats strip ── */}
      {stats && (
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Total Sites',     value: fmtNumber(stats.total_sites),     color: 'text-brand-600' },
                { label: 'Unique Proteins',  value: fmtNumber(stats.total_proteins),  color: 'text-indigo-600' },
                { label: 'GOLD Sites',       value: fmtNumber(stats.gold_sites),       color: 'text-amber-600' },
                { label: 'Species',          value: fmtNumber(Object.keys(stats.species_breakdown).length), color: 'text-emerald-600' },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Charts ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingSpinner label="Loading statistics..." />
        ) : stats ? (
          <>
            <p className="section-title text-center mb-6">Database Overview</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Evidence Tier Distribution', el: <TierPieChart stats={stats} /> },
                { title: 'DAS Score Distribution',     el: <DASBarChart data={dasData} /> },
                { title: 'Top Species',                el: <SpeciesBarChart data={speciesData} /> },
              ].map(c => (
                <div key={c.title} className="card p-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{c.title}</h3>
                  {c.el}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="section-title text-center mb-2">Core Features</p>
          <h2 className="text-center text-xl font-bold text-gray-900 mb-10">
            What makes DeepPhos different?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(c => (
              <div key={c.title} className="card-hover p-5 group">
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl
                                bg-gradient-to-br ${c.color} text-white shadow-sm mb-4
                                group-hover:shadow-md transition-shadow`}>
                  {c.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{c.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick nav cards ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICKLINKS.map(c => (
            <Link key={c.to} to={c.to}
              className="card-hover flex items-start gap-4 p-5 group">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50
                              text-brand-500 group-hover:bg-brand-100 transition-colors shrink-0">
                {c.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                  {c.label}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100
                                        group-hover:translate-x-0 transition-all text-brand-500" />
                </p>
                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
