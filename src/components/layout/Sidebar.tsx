import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Home, Layers, FileText, Info, Database,
  ChevronLeft, ChevronRight, Dna,
} from 'lucide-react'

const NAV = [
  { to: '/',       label: 'Home',    icon: Home     },
  { to: '/browse', label: 'Browse',  icon: Layers   },
  { to: '/batch',  label: 'Batch',   icon: FileText },
  { to: '/about',  label: 'About',   icon: Info     },
]

const QUICK = [
  { label: 'TP53',   id: 'P04637', sub: 'P04637' },
  { label: 'EGFR',   id: 'P00533', sub: 'P00533' },
  { label: 'AKT1',   id: 'P31749', sub: 'P31749' },
  { label: 'MAPK1',  id: 'P28482', sub: 'P28482' },
]

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-white border-r border-gray-200/80
                  transition-all duration-250 ease-in-out overflow-hidden
                  ${collapsed ? 'w-[52px]' : 'w-60'}`}
    >
      {/* Collapse toggle */}
      <div className={`flex items-center px-3 h-12 border-b border-gray-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Menu</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft  className="h-3.5 w-3.5" />}
        </button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {!collapsed && (
          <p className="section-title px-2.5 py-1.5 mb-0.5">Navigation</p>
        )}
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-150
               ${isActive
                 ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-100'
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className={`h-4 w-4 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Lab logo */}
        {!collapsed && (
          <div className="px-2 pt-4 pb-3">
            <a href="https://habdsk.org/" target="_blank" rel="noopener noreferrer"
               className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100 mx-3">
              <img
                src="/lablogo.png"
                alt="Lab Logo"
                className="w-full object-contain hover:scale-[1.02] transition-transform duration-200"
                style={{ maxHeight: 88 }}
              />
            </a>
            <a href="https://habdsk.org/" target="_blank" rel="noopener noreferrer"
               className="block text-center mt-1.5 hover:opacity-80 transition-opacity">
              <span className="italic text-[11px] font-semibold tracking-wide">
                <span style={{ color: '#2563eb' }}>Home </span>
                <span style={{ color: '#16a34a' }}>of </span>
                <span style={{ color: '#9333ea' }}>All </span>
                <span style={{ color: '#dc2626' }}>DataBases</span>
              </span>
            </a>
          </div>
        )}

        {/* Quick access */}
        {!collapsed && (
          <>
            <p className="section-title px-2.5 pt-3 pb-1.5">Quick Access</p>
            {QUICK.map(q => (
              <button
                key={q.id}
                onClick={() => navigate(`/protein/${q.id}`)}
                className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left
                           text-gray-500 hover:bg-gray-50 hover:text-brand-600 transition-all group"
              >
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-gray-100
                                group-hover:bg-brand-50 transition-colors shrink-0">
                  <Database className="h-3 w-3 text-gray-400 group-hover:text-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{q.label}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{q.sub}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Bottom stats */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 px-3 py-3 text-center
                          border border-brand-100/50">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Dna className="h-3.5 w-3.5 text-brand-500" />
              <p className="text-[11px] font-bold text-brand-700">300,038 sites</p>
            </div>
            <p className="text-[10px] text-brand-500/80">44,112 proteins</p>
          </div>
        </div>
      )}
    </aside>
  )
}
