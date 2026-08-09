import { useState, useRef } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { batchAnnotate } from '../api/client'
import { LoadingSpinner, ErrorBox } from '../components/ui/LoadingSpinner'
import { TierBadge, DASBadge, StatusBadge } from '../components/ui/Badge'
import type { BatchResultItem, BatchInputItem } from '../types'

const EXAMPLE = `P04637\tS\t15\nP04637\tS\t20\nP00533\tT\t669\nQ9Y243\tS\t473`
const MAX_SITES = 5000

function parseInput(raw: string): BatchInputItem[] {
  return raw.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => {
      const [a, b, c] = l.split(/[\t,\s]+/)
      return { uniprot_id: a ?? '', residue: b ?? '', position: Number(c) }
    })
    .filter(x => x.uniprot_id && x.residue && !isNaN(x.position))
}

function downloadCsv(rows: BatchResultItem[]) {
  const header = 'uniprot_id,residue,position,status,evidence_tier,das_score,pds\n'
  const body   = rows.map(r => `${r.uniprot_id},${r.residue ?? ''},${r.position},${r.status},${r.evidence_tier ?? ''},${r.das_score ?? ''},${r.pds_score ?? ''}`).join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([header + body], { type: 'text/csv' })),
    download: 'phosnet_batch_results.csv',
  })
  a.click(); URL.revokeObjectURL(a.href)
}

export const BatchAnnotator = () => {
  const [inputText, setInputText] = useState('')
  const [results,   setResults]   = useState<BatchResultItem[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    new FileReader().onload = ev => setInputText(ev.target?.result as string)
    new FileReader().readAsText(f)
  }

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setInputText(ev.target?.result as string)
    reader.readAsText(f)
  }

  const handleSubmit = async () => {
    const sites = parseInput(inputText)
    if (!sites.length)          { setError('No valid sites. Format: UniProtID  RES  POS'); return }
    if (sites.length > MAX_SITES) { setError(`Max ${MAX_SITES} sites. You provided ${sites.length}.`); return }
    setError(''); setLoading(true)
    try   { setResults(await batchAnnotate(sites)) }
    catch { setError('Batch request failed. Check the API is running.') }
    finally { setLoading(false) }
  }

  const known    = results.filter(r => r.status === 'KNOWN').length
  const novel    = results.filter(r => r.status === 'NOVEL').length
  const notFound = results.filter(r => r.status === 'NOT_FOUND').length
  const parsed   = parseInput(inputText).length

  return (
    <div className="page-wrap">

      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">
          <span className="gradient-text">Batch</span>
          <span style={{ color: 'var(--color-text)' }}> Annotator</span>
        </h1>
        <span className="page-subtitle">
          Submit up to {MAX_SITES.toLocaleString()} sites · receive KNOWN / NOVEL / NOT_FOUND labels with full evidence metadata
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-blue" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0, color: 'var(--color-text)' }}>Input Sites</p>
              <button onClick={() => setInputText(EXAMPLE)}
                style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                Load example
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={'One site per line:\nUniProtID  RES  POS\n\nExample:\nP04637  S  15\nP00533  T  669'}
              style={{
                width: '100%', height: 185, border: '1.5px solid var(--color-border-blue)', borderRadius: 8,
                padding: '10px 12px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono',monospace",
                resize: 'none', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)',
                transition: 'border-color .15s, box-shadow .15s', lineHeight: 1.55,
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = '#60A5FA'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(96,165,250,.15)' }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border-blue)'; e.currentTarget.style.boxShadow = 'none' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <button onClick={() => fileRef.current?.click()} className="btn-ghost" style={{ fontSize: '0.78rem' }}>
                <Upload size={13} /> Upload TSV
              </button>
              <input ref={fileRef} type="file" accept=".tsv,.txt,.csv" style={{ display: 'none' }} onChange={handleFileRead} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', marginLeft: 'auto' }}>
                {parsed > 0 ? `${parsed} sites` : 'none parsed'}
              </span>
            </div>

            {error && <div style={{ marginTop: 10 }}><ErrorBox message={error} /></div>}

            <button onClick={handleSubmit} disabled={loading || !inputText.trim()} className="btn-primary"
              style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
              {loading ? 'Annotating…' : 'Annotate Sites'}
            </button>
          </div>

          {/* Format guide */}
          <div className="card-indigo" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-primary)', marginBottom: 8 }}>
              <HelpCircle size={13} /> Format Guide
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: 8, marginTop: 0 }}>
              Tab, comma, or space-separated · one site per line:
            </p>
            <div className="code-block" style={{ fontSize: '0.75rem', padding: '8px 12px', lineHeight: 1.7 }}>
              {'UniProtID  RES  POS'}<br />
              {'P04637     S    15'}<br />
              {'P00533     T    669'}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-faint)', marginTop: 8, marginBottom: 0 }}>
              RES: S, T, or Y &nbsp;·&nbsp; POS: integer position
            </p>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {loading && <LoadingSpinner label="Annotating sites…" />}

          {!loading && results.length > 0 && (
            <>
              {/* Summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label:'KNOWN',     count: known,    icon: <CheckCircle size={18} />, color: '#059669', bg: '#ECFDF5' },
                  { label:'NOVEL',     count: novel,    icon: <AlertCircle size={18} />, color: '#2563EB', bg: '#EFF6FF' },
                  { label:'NOT FOUND', count: notFound, icon: <HelpCircle  size={18} />, color: '#94a3b8', bg: '#F8FAFC' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg, border: '1.5px solid var(--color-border)',
                    borderRadius: 12, padding: '16px 12px', textAlign: 'center',
                  }}>
                    <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'1.3rem', color: s.color, margin: '0 0 3px' }}>{s.count}</p>
                    <p className="stat-label">{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button onClick={() => downloadCsv(results)} className="btn-ghost">
                  <Download size={13} /> Download CSV
                </button>
              </div>

              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {['UniProt','Res','Pos','Status','Tier','DAS','PDS'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem', fontWeight:600 }}>{r.uniprot_id}</td>
                          <td>{r.residue ?? '—'}</td>
                          <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem' }}>{r.position}</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>{r.evidence_tier ? <TierBadge tier={r.evidence_tier} /> : '—'}</td>
                          <td>{r.das_score != null ? <DASBadge das={r.das_score} /> : '—'}</td>
                          <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem', color:'var(--color-muted)' }}>{r.pds_score ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!loading && results.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: 260, color: 'var(--color-faint)', textAlign: 'center',
              border: '2px dashed var(--color-border-blue)', borderRadius: 14,
            }}>
              <Upload size={36} style={{ color: 'var(--color-border-blue)', marginBottom: 12 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>No results yet</p>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Paste sites or upload a file, then click Annotate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
