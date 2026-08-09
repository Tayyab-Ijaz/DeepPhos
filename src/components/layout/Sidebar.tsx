import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Layers, FileText, Info, ExternalLink, FlaskConical, Dna } from 'lucide-react'

const NAV_MAIN = [
  { to: '/',       label: 'Home',           icon: Home,         end: true  },
  { to: '/browse', label: 'Browse Sites',   icon: Layers,       end: false },
  { to: '/batch',  label: 'Batch Annotator',icon: FileText,     end: false },
  { to: '/about',  label: 'About & Methods',icon: Info,         end: false },
]

const NAV_EXTERNAL = [
  { href: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`,
    label: 'API Docs', icon: FlaskConical },
  { href: 'https://habdsk.org/', label: 'S-Khan Lab', icon: ExternalLink },
]

const QUICK_PROTEINS = [
  { label: 'TP53',  id: 'P04637' },
  { label: 'EGFR',  id: 'P00533' },
  { label: 'AKT1',  id: 'P31749' },
  { label: 'MAPK1', id: 'P28482' },
]

export const Sidebar = () => {
  const navigate = useNavigate()

  return (
    <aside className="sidebar hidden md:flex">

      {/* ── Lab logo ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
        <a href="https://habdsk.org/" target="_blank" rel="noopener noreferrer"
           className="block rounded-xl overflow-hidden border hover:opacity-90 transition-opacity"
           style={{ borderColor: 'var(--color-border-blue)' }}>
          <img src="/lablogo.png" alt="S-Khan Lab" className="w-full object-contain" style={{ maxHeight: 76 }} />
        </a>
        <a href="https://habdsk.org/" target="_blank" rel="noopener noreferrer"
           className="block text-center mt-2 hover:opacity-80 transition-opacity">
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>
            <span style={{ color: '#2563eb' }}>Home </span>
            <span style={{ color: '#16a34a' }}>of </span>
            <span style={{ color: '#9333ea' }}>All </span>
            <span style={{ color: '#dc2626' }}>DataBases</span>
          </span>
        </a>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="sidebar-section-label">Navigation</p>
        {NAV_MAIN.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </NavLink>
        ))}

        <p className="sidebar-section-label mt-3">External</p>
        {NAV_EXTERNAL.map(({ href, label, icon: Icon }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
             className="sidebar-nav-item">
            <Icon size={15} className="shrink-0" />
            {label}
            <ExternalLink size={10} className="ml-auto opacity-40" />
          </a>
        ))}

        {/* Quick access */}
        <p className="sidebar-section-label mt-3">Quick Access</p>
        {QUICK_PROTEINS.map(q => (
          <button key={q.id}
            onClick={() => navigate(`/protein/${q.id}`)}
            className="sidebar-nav-item w-full text-left"
            style={{ cursor: 'pointer' }}
          >
            <Dna size={14} className="shrink-0 opacity-60" />
            <span>{q.label}</span>
            <span className="ml-auto text-[10px] font-mono opacity-50">{q.id}</span>
          </button>
        ))}
      </nav>

      {/* ── DB stats card ─────────────────────────────────────────────── */}
      <div className="px-3 pb-4">
        <div className="rounded-xl px-3 py-3 text-center"
             style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-blue)' }}>
          <p className="mono-val" style={{ fontSize: '0.875rem' }}>300,038</p>
          <p className="stat-label">phospho sites</p>
          <div className="mt-1.5 pt-1.5" style={{ borderTop: '1px solid var(--color-border-blue)' }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              44,112 proteins
            </p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: 2 }}>
              ESM2-650M · PhosConsensus-Predict
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
