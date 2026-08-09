import { Brain } from 'lucide-react'

const InfoCard = ({ children, accentColor = '#2563EB' }: { children: React.ReactNode; accentColor?: string }) => (
  <div className="card" style={{ borderTop: `3px solid ${accentColor}`, marginBottom: 16 }}>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
)

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: 10,
  }}>{children}</p>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.75, marginBottom: 10 }}>{children}</p>
)

const SourceTable = () => (
  <div style={{ overflowX: 'auto' }}>
    <table className="data-table">
      <thead>
        <tr>
          {['Database', 'Sites', 'Species', 'Notes'].map(h => <th key={h}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {[
          ['PhosphoSitePlus', '~250,000', 'Multi-species', 'Curated, literature-based'],
          ['Phospho.ELM',     '~42,000',  'Multi-species', 'Experimental, MS/MS + literature'],
          ['PTMS Dataset',    '~190,672', 'Multi-species', 'High-throughput MS/MS'],
          ['DbPAF / SysPTM',  'Included', 'Multi-species', 'Aggregated via PMID overlap'],
        ].map(row => (
          <tr key={row[0]}>
            <td style={{ fontWeight: 600 }}>{row[0]}</td>
            <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem' }}>{row[1]}</td>
            <td>{row[2]}</td>
            <td style={{ color: 'var(--color-muted)' }}>{row[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const About = () => (
  <div style={{ maxWidth: 840, padding: '28px 32px' }}>

    {/* Page header */}
    <div style={{ marginBottom: 28 }}>
      <h1 className="page-title">About PhosNet</h1>
      <p className="page-subtitle">
        A unified, consensus-scored resource for serine, threonine and tyrosine phosphorylation,
        integrating five major databases with ML-guided novel site rescue.
      </p>
    </div>

    {/* Background */}
    <InfoCard accentColor="#2563EB">
      <CardTitle>Background</CardTitle>
      <P>
        Phosphorylation is the most prevalent post-translational modification in eukaryotic
        signalling. Despite the availability of several specialist databases
        (PhosphoSitePlus, Phospho.ELM, HPRD, DbPAF, SysPTM), each resource captures a
        different subset of the experimentally verified landscape. PhosNet integrates these
        sources into a single, confidence-scored database.
      </P>
      <P>
        A key challenge is that no single raw file captures all sources simultaneously.
        PhosNet documents this as a provenance limitation: DAS=0 sites are those that appear
        only in one aggregated file and cannot be unambiguously attributed to a single
        upstream database.
      </P>
    </InfoCard>

    {/* Pipeline */}
    <InfoCard accentColor="#7c3aed">
      <CardTitle>Pipeline Overview</CardTitle>
      <P>
        The schematic below illustrates the full PhosNet data integration and scoring
        pipeline — from raw source databases through consensus scoring, evidence tiering,
        and ML-guided novel site rescue.
      </P>
      <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-border-blue)' }}>
        <img src="/pipeline_flowchart.png" alt="PhosNet pipeline flowchart"
             style={{ width: '100%', maxHeight: 600, objectFit: 'contain', display: 'block' }} />
      </div>
    </InfoCard>

    {/* Data sources */}
    <InfoCard accentColor="#059669">
      <CardTitle>Data Sources</CardTitle>
      <P>The following primary databases were integrated into PhosNet:</P>
      <SourceTable />
    </InfoCard>

    {/* Scoring */}
    <InfoCard accentColor="#d97706">
      <CardTitle>Scoring System</CardTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="stat-box" style={{ textAlign: 'left', padding: '14px 16px' }}>
          <p style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, color: 'var(--color-text)' }}>
            Database Agreement Score (DAS)
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.55 }}>
            Counts how many distinct source databases report a given (UniProt ID, residue type, position) triplet.
          </p>
          <span className="source-tag" style={{ marginTop: 10, display: 'inline-block' }}>Range: 0 – 3</span>
        </div>
        <div className="stat-box" style={{ textAlign: 'left', padding: '14px 16px' }}>
          <p style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: 6, color: 'var(--color-text)' }}>
            Publication Depth Score (PDS)
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.55 }}>
            Number of unique PubMed IDs that report a given site, reflecting independent experimental detection.
          </p>
          <span className="source-tag" style={{ marginTop: 10, display: 'inline-block', borderColor: '#a7f3d0', color: '#059669', background: '#ecfdf5' }}>Range: 0 – n</span>
        </div>
      </div>

      <div style={{ background: '#0f172a', borderRadius: 10, padding: '12px 18px', marginBottom: 12 }}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', color: '#93c5fd', marginBottom: 4 }}>
          Confidence Score
        </p>
        <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.875rem', color: '#f1f5f9' }}>
          confidence = DAS × log(1 + PDS)
        </code>
      </div>

      {/* Evidence tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { tier: 'GOLD',   rule: 'DAS ≥ 2 OR PDS ≥ 5',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { tier: 'SILVER', rule: 'DAS ≥ 1 AND PDS ≥ 2',   color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
          { tier: 'BRONZE', rule: 'All remaining sites',     color: '#b45309', bg: '#fefce8', border: '#fef08a' },
        ].map(t => (
          <div key={t.tier} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: t.bg, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: '10px 14px',
          }}>
            <span style={{ height: 10, width: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: t.color, width: 60 }}>{t.tier}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{t.rule}</span>
          </div>
        ))}
      </div>
    </InfoCard>

    {/* ML prediction */}
    <InfoCard accentColor="#DB2777">
      <CardTitle>ML Prediction — PhosConsensus-Predict</CardTitle>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 42, width: 42, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed,#DB2777)', color: '#fff',
        }}>
          <Brain size={20} />
        </div>
        <div>
          <P>
            A multi-layer perceptron trained on ESM-2 (650M) per-residue embeddings (1,280 dimensions).
            Only serine, threonine and tyrosine positions are embedded, reducing storage by ~20× versus
            full-sequence embeddings.
          </P>
          <P>
            Training uses evidence-weighted binary cross-entropy, GroupKFold cross-validation at the
            protein level, and CosineAnnealingLR scheduling. Deployed as ONNX for production serving.
          </P>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            {[
              { label: 'AUC-ROC (held-out)', value: '0.8928' },
              { label: 'AUC-PR (held-out)',  value: '0.5323' },
              { label: 'Test sites',          value: '157,117' },
            ].map(m => (
              <div key={m.label} className="stat-box" style={{ padding: '8px 14px' }}>
                <p className="stat-value" style={{ fontSize: '1rem' }}>{m.value}</p>
                <p className="stat-label">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InfoCard>

  </div>
)
