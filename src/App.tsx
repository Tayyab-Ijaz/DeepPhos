import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar }         from './components/layout/Sidebar'
import { Footer }          from './components/layout/Footer'
import { Home }            from './pages/Home'
import { ProteinExplorer } from './pages/ProteinExplorer'
import { SiteDetail }      from './pages/SiteDetail'
import { Browse }          from './pages/Browse'
import { BatchAnnotator }  from './pages/BatchAnnotator'
import { About }           from './pages/About'

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32" style={{ color: 'var(--color-muted)' }}>
    <p style={{ fontSize: '4rem', fontWeight: 800, color: '#BFDBFE', lineHeight: 1 }}>404</p>
    <p className="mt-3 text-base">Page not found.</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>

        {/* Sidebar — sole navigation (UbiFilter pattern) */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1">
            <Routes>
              <Route path="/"                          element={<Home />} />
              <Route path="/protein/:uniprotId"        element={<ProteinExplorer />} />
              <Route path="/site/:uniprotId/:res/:pos" element={<SiteDetail />} />
              <Route path="/browse"                    element={<Browse />} />
              <Route path="/batch"                     element={<BatchAnnotator />} />
              <Route path="/about"                     element={<About />} />
              <Route path="*"                          element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  )
}
