import { useState, useRef } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { batchAnnotate } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, DASBadge, StatusBadge } from '../components/ui/Badge'
import type { BatchResultItem, BatchInputItem } from '../types'

const EXAMPLE = `P04637\tS\t15
P04637\tS\t20
P00533\tT\t669
Q9Y243\tS\t473`

const MAX_SITES = 5000

function parseInput(raw: string): BatchInputItem[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const parts = l.split(/[\t,\s]+/)
      return { uniprot_id: parts[0] ?? '', residue: parts[1] ?? '', position: Number(parts[2]) }
    })
    .filter(x => x.uniprot_id && x.residue && !isNaN(x.position))
}

function downloadCsv(rows: BatchResultItem[]) {
  const header = 'uniprot_id,residue,position,status,evidence_tier,das_score,pds\n'
  const body = rows.map(r =>
    `${r.uniprot_id},${r.residue ?? ''},${r.position},${r.status},${r.evidence_tier ?? ''},${r.das_score ?? ''},${r.pds_score ?? ''}`
  ).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'phdb_batch_results.csv'; a.click()
  URL.revokeObjectURL(url)
}

export const BatchAnnotator = () => {
  const [inputText, setInputText]   = useState('')
  const [results,   setResults]     = useState<BatchResultItem[]>([])
  const [loading,   setLoading]     = useState(false)
  const [error,     setError]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setInputText(ev.target?.result as string)
    reader.readAsText(f)
  }

  const handleSubmit = async () => {
    const sites = parseInput(inputText)
    if (sites.length === 0) { setError('No valid sites found. Use format: UniProtID  RES  POS'); return }
    if (sites.length > MAX_SITES) { setError(`Max ${MAX_SITES} sites per request. You provided ${sites.length}.`); return }
    setError('')
    setLoading(true)
    try {
      const res = await batchAnnotate(sites)
      setResults(res)
    } catch {
      setError('Batch request failed. Check that the API is running.')
    } finally {
      setLoading(false)
    }
  }

  const known  = results.filter(r => r.status === 'KNOWN').length
  const novel  = results.filter(r => r.status === 'NOVEL').length
  const notFound = results.filter(r => r.status === 'NOT_FOUND').length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Batch Annotator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit up to {MAX_SITES.toLocaleString()} sites. Each site is labelled KNOWN, NOVEL, or NOT_FOUND.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Input panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">Input Sites</h2>
              <button
                onClick={() => setInputText(EXAMPLE)}
                className="text-xs text-brand-600 hover:underline"
              >
                Load example
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`One site per line:\nUniProtID  RES  POS\n\nExample:\nP04637  S  15\nP00533  T  669`}
              className="w-full h-48 border border-gray-200 rounded-lg p-3 text-xs font-mono
                         focus:outline-none focus:border-brand-400 resize-none"
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-xs border border-gray-200 rounded-lg px-3 py-1.5
                           hover:border-brand-400 text-gray-600"
              >
                <Upload className="h-3.5 w-3.5" /> Upload TSV
              </button>
              <input ref={fileRef} type="file" accept=".tsv,.txt,.csv" className="hidden" onChange={handleFile} />
              <span className="text-xs text-gray-400 ml-auto">
                {parseInput(inputText).length} sites parsed
              </span>
            </div>

            {error && <div className="mt-3"><ErrorBox message={error} /></div>}

            <button
              onClick={handleSubmit}
              disabled={loading || !inputText.trim()}
              className="mt-4 w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold
                         hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Annotating…' : 'Annotate'}
            </button>
          </div>

          {/* Format help */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 space-y-1">
            <div className="flex items-center gap-1 font-semibold mb-2">
              <HelpCircle className="h-3.5 w-3.5" /> Format guide
            </div>
            <p>Tab-separated or space-separated, one site per line:</p>
            <code className="block bg-blue-100 rounded p-2 mt-1 font-mono">
              UniProtID  RES  POS<br />
              P04637  S  15<br />
              P00533  T  669
            </code>
            <p className="mt-2">RES: S, T, or Y. POS: integer position.</p>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3">
          {loading && <LoadingSpinner label="Annotating sites…" />}

          {!loading && results.length > 0 && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'KNOWN',     count: known,    icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
                  { label: 'NOVEL',     count: novel,    icon: <AlertCircle className="h-4 w-4 text-blue-500" /> },
                  { label: 'NOT FOUND', count: notFound, icon: <HelpCircle  className="h-4 w-4 text-gray-400" /> },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <p className="text-xl font-bold text-gray-800">{s.count}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mb-2">
                <button
                  onClick={() => downloadCsv(results)}
                  className="flex items-center gap-2 text-xs border border-gray-200 rounded-lg px-3 py-1.5
                             hover:border-brand-400 text-gray-600"
                >
                  <Download className="h-3.5 w-3.5" /> Download CSV
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        {['UniProt', 'Res', 'Pos', 'Status', 'Tier', 'DAS', 'PDS'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono text-xs">{r.uniprot_id}</td>
                          <td className="px-4 py-2">{r.residue ?? '—'}</td>
                          <td className="px-4 py-2">{r.position}</td>
                          <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-2">
                            {r.evidence_tier ? <TierBadge tier={r.evidence_tier} /> : '—'}
                          </td>
                          <td className="px-4 py-2">
                            {r.das_score != null ? <DASBadge das={r.das_score} /> : '—'}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {r.pds_score ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
              <Upload className="h-10 w-10 mb-3 text-gray-200" />
              <p>Paste sites or upload a file, then click Annotate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
