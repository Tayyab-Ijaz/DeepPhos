const DB_META: Record<string, { label: string; bg: string; color: string }> = {
  PhosphoSitePlus:    { label: 'PSP',   bg: '#DBEAFE', color: '#1D4ED8' },
  'Phospho.ELM':      { label: 'ELM',   bg: '#EDE9FE', color: '#6D28D9' },
  PTMS_dataset:       { label: 'PTMS',  bg: '#D1FAE5', color: '#065F46' },
  DbPAF_SysPTM_other: { label: 'Other', bg: '#F1F5F9', color: '#475569' },
}

export const EvidenceBar = ({ sources, pds }: { sources: string[]; pds: number }) => (
  <div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: sources.length ? 4 : 0 }}>
      {sources.map(src => {
        const m = DB_META[src] ?? { label: src, bg: '#F1F5F9', color: '#475569' }
        return (
          <span key={src} style={{
            display: 'inline-block',
            background: m.bg, color: m.color,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.625rem', fontWeight: 700,
            padding: '2px 6px', borderRadius: 4,
            border: `1px solid ${m.bg === '#F1F5F9' ? '#E2E8F0' : m.bg}`,
          }}>
            {m.label}
          </span>
        )
      })}
      {sources.length === 0 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)' }}>—</span>
      )}
    </div>
    {pds > 0 && (
      <p style={{ fontSize: '0.7rem', color: 'var(--color-faint)', margin: 0 }}>
        {pds} pub{pds !== 1 ? 's' : ''}
      </p>
    )}
  </div>
)
