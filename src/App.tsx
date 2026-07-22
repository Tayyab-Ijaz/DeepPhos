import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar }          from './components/layout/Navbar'
import { Sidebar }         from './components/layout/Sidebar'
import { Footer }          from './components/layout/Footer'
import { Home }            from './pages/Home'
import { ProteinExplorer } from './pages/ProteinExplorer'
import { SiteDetail }      from './pages/SiteDetail'
import { Browse }          from './pages/Browse'
import { BatchAnnotator }  from './pages/BatchAnnotator'
import { About }           from './pages/About'

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-500">
    <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
    <p className="text-lg">Page not found.</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Top navbar */}
        <Navbar />

        {/* Body: sidebar + main */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

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
      </div>
    </BrowserRouter>
  )
}
