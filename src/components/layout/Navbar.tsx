import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, Dna, Menu, X, ExternalLink } from 'lucide-react'

export const Navbar = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/protein/${query.trim().toUpperCase()}`)
      setQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
              <Dna className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                PhosNet
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 font-medium tracking-wide">
                Phosphorylation Meta-Database
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by UniProt ID or gene name (e.g. P04637, TP53)"
                className="input-field pl-10 pr-4 py-2 bg-gray-50/80 hover:bg-gray-50 focus:bg-white"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-1">
            <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`}
               target="_blank" rel="noreferrer"
               className="flex items-center gap-1.5 btn-ghost text-xs">
              API Docs <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2 shadow-lg">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search UniProt ID or gene..."
                className="input-field pl-9"
              />
            </div>
          </form>
          {[
            { to: '/',       label: 'Home'   },
            { to: '/browse', label: 'Browse' },
            { to: '/batch',  label: 'Batch'  },
            { to: '/about',  label: 'About'  },
          ].map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
