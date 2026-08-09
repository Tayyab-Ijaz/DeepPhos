import { Brain } from 'lucide-react'
import type { ReactNode } from 'react'

const InfoCard = ({ children, color = '#2563EB' }: { children: ReactNode; color?: string }) => (
  <div className="card" style={{ borderTop: `3px solid ${color}`, marginBottom: 18 }}>
    <div style={{ padding: '20px 22px' }}>{children}</div>
  </div>
)

const CardLabel = ({ children, color = 'var(--color-primary)' }: { children: ReactNode; color?: string }) => (
  <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color, marginTop: 0, marginBottom: 12 }}>
    {children}
  </p>
)

const P = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.75, margin: '0 0 10px' }}>{children}</p>
)

const SourceTable = () => (
  <div style={{ overflowX: 'auto' }}>
    <table className="data-table">
      <thead><tr>
        {['Database','Sites','Species','Notes'].map(h => <th key={h}>{h}</th>)}
      </tr></thead>
      <tbody>
        {[
          ['PhosphoSitePlus','~250,000','Multi-species','Curated, literature-based'],
          ['Phospho.ELM',    '~42,000', 'Multi-species','Experimental MS/MS + literature'],
          ['PTMS Dataset',   '~190,672','Multi-species','High-throughput MS/MS'],
          ['DbPAF / SysPTM', 'Included','Multi-species','Aggregated via PMID overlap'],
        ].map(row => (
          <tr key={row[0]}>
            <td style={{ fontWeight: 700 }}>{row[0]}</td>
            <td><span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem' }}>{row[1]}</span></td>
            <td>{row[2]}</td>
            <td style={{ color:'var(--color-muted)', fontSize:'0.8rem' }}>{row[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const About = () => (
  <div className="page-wrap" style={{ maxWidth: 860, margin: '0 auto' }}>

    <div style={{ marginBottom: 24 }}>
      <h1 className="page-title">
        <span className="gradient-text">About</span>
        <span style={{ color: 'var(--color-text)' }}> PhosNet</span>
      </h1>
      <span className="page-subtitle">
        Consensus-scored phosphorylation meta-database · 5 integrated sources · ML-guided novel site rescue
      </span>
    </div>

    <InfoCard color="#2563EB">
      <CardLabel>Background</CardLabel>
      <P>Phosphorylation is the most prevalent post-translational modification in eukaryotic signalling. Despite the availability of several specialist databases (PhosphoSitePlus, Phospho.ELM, HPRD, DbPAF, SysPTM), each resource captures a different subset of the experimentally verified landscape. PhosNet integrates these sources into a single, confidence-scored database.</P>
      <P>A key methodological note: DAS=0 sites (66.9%) appear only in the aggregated DbPAF/SysPTM file and cannot be unambiguously attributed to a single upstream database. This is documented transparently in the Methods and Limitations.</P>
    </InfoCard>

    <InfoCard color="#7c3aed">
      <CardLabel color="#7c3aed">Pipeline Overview</CardLabel>
      <P>The schematic below illustrates the full PhosNet data integration and scoring pipeline — from raw source databases through consensus scoring, evidence tiering, and ML-guided novel site rescue.</P>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-border-blue)', marginTop: 10 }}>
        <img src="/pipeline_flowchart.png" alt="PhosNet pipeline flowchart"
             style={{ width: '100%', maxHeight: 580, objectFit: 'contain', display: 'block' }} />
      </div>
    </InfoCard>

    <InfoCard color="#059669">
      <CardLabel color="#059669">Data Sources</CardLabel>
      <P>The following primary databases were integrated into PhosNet:</P>
      <SourceTable />
    </InfoCard>

    <InfoCard color="#d97706">
      <CardLabel color="#d97706">Scoring System</CardLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { title: 'Database Agreement Score (DAS)', desc: 'Counts distinct source databases reporting a given (UniProt ID, residue, position) triplet. Range 0–3.', badge: 'Range: 0 – 3', badgeColor: '#2563EB' },
          { title: 'Publication Depth Score (PDS)',  desc: 'Number of unique PubMed IDs reporting a site — reflects independent experimental detection within 47 curated studies.', badge: 'Range: 0 – n', badgeColor: '#059669' },
        ].map(s => (
          <div key={s.title} className="stat-box" style={{ textAlign: 'left', padding: '14px 16px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.8125rem', marginTop: 0, marginBottom: 7, color: 'var(--color-text)' }}>{s.title}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.55, margin: '0 0 10px' }}>{s.desc}</p>
            <span className="source-tag" style={{ color: s.badgeColor }}>{s.badge}</span>
          </div>
        ))}
      </div>

      <div className="code-block" style={{ marginBottom: 14 }}>
        <span style={{ color: '#93c5fd', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>Confidence Score</span>
        confidence = DAS × log(1 + PDS)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          { tier:'GOLD',   rule:'DAS ≥ 2 OR PDS ≥ 5',    bg:'#fffbeb', border:'#fde68a', color:'#d97706' },
          { tier:'SILVER', rule:'DAS ≥ 1 AND PDS ≥ 2',   bg:'#f9fafb', border:'#e5e7eb', color:'#6b7280' },
          { tier:'BRONZE', rule:'All remaining sites',    bg:'#fefce8', border:'#fef08a', color:'#b45309' },
        ].map(t => (
          <div key={t.tier} style={{ display:'flex', alignItems:'center', gap:12, background:t.bg, border:`1px solid ${t.border}`, borderRadius:8, padding:'9px 14px' }}>
            <span style={{ height:9, width:9, borderRadius:'50%', background:t.color, flexShrink:0 }} />
            <span style={{ fontWeight:700, fontSize:'0.8125rem', color:t.color, width:58 }}>{t.tier}</span>
            <span style={{ fontSize:'0.8125rem', color:'var(--color-muted)' }}>{t.rule}</span>
          </div>
        ))}
      </div>
    </InfoCard>

    <InfoCard color="#DB2777">
      <CardLabel color="#DB2777">ML Prediction — PhosConsensus-Predict</CardLabel>
      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', height:42, width:42, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#DB2777)', color:'#fff' }}>
          <Brain size={20} />
        </div>
        <div style={{ flex:1 }}>
          <P>Multi-layer perceptron trained on ESM-2 (650M) per-residue embeddings (1,280 dimensions). Only S/T/Y positions are embedded — reducing storage by ~20× versus full-sequence embeddings. Trained with GroupKFold cross-validation at the protein level (no data leakage).</P>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:12 }}>
            {[
              { label:'AUC-ROC (held-out)', value:'0.8928' },
              { label:'AUC-PR (held-out)',  value:'0.5323' },
              { label:'Test sites',          value:'157,117' },
              { label:'KinaseLink AUC',      value:'0.918' },
            ].map(m => (
              <div key={m.label} className="stat-box" style={{ padding:'9px 14px', minWidth:100 }}>
                <p className="stat-value" style={{ fontSize:'0.95rem' }}>{m.value}</p>
                <p className="stat-label">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InfoCard>

  </div>
)
