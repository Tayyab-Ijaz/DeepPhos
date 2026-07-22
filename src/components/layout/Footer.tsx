import { Dna } from 'lucide-react'

export const Footer = () => (
  <footer className="border-t border-gray-200/80 bg-gray-50/50">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Dna className="h-3.5 w-3.5 text-brand-400" />
          <span className="font-semibold text-gray-500">DeepPhos</span>
          <span className="text-gray-300">|</span>
          <span>300,038 sites across 44,112 proteins</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/about" className="hover:text-brand-600 transition-colors">About</a>
          <a href="/about#citation" className="hover:text-brand-600 transition-colors">Cite</a>
          <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`}
             target="_blank" rel="noreferrer" className="hover:text-brand-600 transition-colors">API</a>
        </div>
        <p className="text-gray-300">&copy; 2026 DeepPhos. CC BY 4.0.</p>
      </div>
    </div>
  </footer>
)
