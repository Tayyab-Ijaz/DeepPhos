import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Home, Layers, FileText, Info, ExternalLink, FlaskConical, Dna, Search, Menu, X } from 'lucide-react'

const NAV = [
  { to: '/',       label: 'Home',            icon: Home,          end: true  },
  { to: '/browse', label: 'Browse Sites',    icon: Layers,        end: false },
  { to: '/batch',  label: 'Batch Annotator', icon: FileText,      end: false },
  { to: '/about',  label: 'About & Methods', icon: Info,          end: false },
]

const EXTERNAL = [
  { href: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`, label: 'API Docs', icon: FlaskConical },
  { href: 'https://habdsk.org/', label: 'S-Khan Lab', icon: Home },
]

const QUICK = [
  { label: 'TP53',  id: 'P04637' },
  { label: 'EGFR',  id: 'P00533' },
  { label: 'AKT1',  id: 'P31749' },
  { label: 'MAPK1', id: 'P28482' },
]

const SidebarContent = ({ onNav }: { onNav?: () => void }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim().toUpperCase()
    if (q) { navigate(`/protein/${q}`); setQuery(''); onNav?.() }
  }

  return (
    <>
      {/* Lab logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--color-border-light)' }}>
        <a href="https://habdsk.org/" target="_blank" rel="noopener noreferrer"
           style={{ display: 'block', borderRadius: 10, overflow: 'hidden',
                    border: '1px solid var(--color-border-blue)', textDecoration: 'none' }}>
          <img src="/lablogo.png" alt="S-Khan Lab"
               style={{ width: '100%', objectFit: 'contain', display: 'block', maxHeight: 72 }} />
        </a>
        <a href="https://habdsk.org/" target="_blank" rel="noopener noreferrer"
           style={{ display: 'block', textAlign: 'center', marginTop: 7, textDecoration: 'none' }}>
          <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.4 }}>
            <span style={{ color: '#2563eb' }}>Home </span>
            <span style={{ color: '#16a34a' }}>of </span>
            <span style={{ color: '#9333ea' }}>All </span>
            <span style={{ color: '#dc2626' }}>DataBases</span>
          </span>
        </a>
      </div>

      {/* Quick search */}
      <div style={{ padding: '10px 12px 6px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{
              position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-faint)', pointerEvents: 'none',
            }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="UniProt ID / gene…"
              style={{
                width: '100%', padding: '7px 8px 7px 26px',
                border: '1.5px solid var(--color-border-blue)', borderRadius: 7,
                fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none',
                background: 'var(--color-bg)', color: 'var(--color-text)', transition: 'border-color .15s',
              }}
              onFocus={e  => (e.currentTarget.style.borderColor = '#60A5FA')}
              onBlur={e   => (e.currentTarget.style.borderColor = 'var(--color-border-blue)')}
            />
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
        <span className="sidebar-section-label">Navigation</span>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNav}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <Icon size={14} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: 6 }}>External</span>
        {EXTERNAL.map(({ href, label, icon: Icon }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
             className="sidebar-nav-item" onClick={onNav}>
            <Icon size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{label}</span>
            <ExternalLink size={10} style={{ color: 'var(--color-faint)', flexShrink: 0 }} />
          </a>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: 6 }}>Quick Access</span>
        {QUICK.map(q => (
          <button key={q.id}
            onClick={() => { navigate(`/protein/${q.id}`); onNav?.() }}
            className="sidebar-nav-item">
            <Dna size={13} style={{ flexShrink: 0, opacity: 0.55 }} />
            <span style={{ flex: 1, fontWeight: 600 }}>{q.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--color-faint)' }}>
              {q.id}
            </span>
          </button>
        ))}
      </nav>

      {/* DB stats */}
      <div style={{ padding: '10px 12px 14px' }}>
        <div style={{
          borderRadius: 10, padding: '12px 14px', textAlign: 'center',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 100%)',
          border: '1px solid var(--color-border-blue)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 3 }}>
            <Dna size={13} style={{ color: 'var(--color-primary)' }} />
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '0.825rem', color: 'var(--color-primary)',
            }}>300,038 sites</span>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', fontWeight: 500, color: 'var(--color-muted)', margin: 0 }}>
            44,112 proteins · ≥13 species
          </p>
          <p style={{ fontSize: '0.6rem', color: 'var(--color-faint)', marginTop: 4, marginBottom: 0 }}>
            ESM2-650M · PhosConsensus-Predict
          </p>
        </div>
      </div>
    </>
  )
}

export const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none', position: 'fixed', top: 14, left: 14, zIndex: 60,
          background: 'var(--color-primary)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '7px 9px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,.35)',
        }}
        className="md-hidden-btn"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'block', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 50, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 'var(--sidebar-width)', zIndex: 55,
          background: '#fff', display: 'flex', flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.22s ease',
          borderRight: '1.5px solid var(--color-border-light)',
          boxShadow: '4px 0 20px rgba(37,99,235,.12)',
        }}
        className="md-hidden-drawer"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 12px' }}>
          <button onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <SidebarContent onNav={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar — sticky */}
      <aside className="sidebar" style={{ display: 'none' }} id="desktop-sidebar">
        <SidebarContent />
      </aside>

      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar  { display: flex !important; flex-direction: column; }
          .md-hidden-btn    { display: none !important; }
          .md-hidden-drawer { display: none !important; transform: none !important; }
        }
        @media (max-width: 767px) {
          .md-hidden-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
