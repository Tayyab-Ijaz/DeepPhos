export const Footer = () => (
  <footer style={{
    borderTop: '1px solid var(--color-border-light)',
    background: '#ffffff',
    padding: '14px 24px',
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      fontSize: '11px',
      color: 'var(--color-muted)',
    }}>
      <span>
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>PhosNet</span>
        {' '}— 300,038 phosphorylation sites · 44,112 proteins · ≥13 species
      </span>
      <div style={{ display: 'flex', gap: '16px' }}>
        <a href="/about" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
           onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
           onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
          About
        </a>
        <a href="/about#citation" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
           onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
           onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
          Cite
        </a>
        <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`}
           target="_blank" rel="noreferrer"
           style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
           onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
           onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
          API
        </a>
        <a href="https://habdsk.org/" target="_blank" rel="noreferrer"
           style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
           onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
           onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
          S-Khan Lab
        </a>
      </div>
      <span style={{ color: '#94a3b8' }}>&copy; 2026 PhosNet · CC BY 4.0</span>
    </div>
  </footer>
)
