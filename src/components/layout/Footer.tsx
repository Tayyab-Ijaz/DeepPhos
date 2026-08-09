export const Footer = () => (
  <footer style={{ borderTop: '1.5px solid var(--color-border-light)', background: '#ffffff', padding: '12px 30px' }}>
    <style>{`
      .footer-link { color: var(--color-faint); text-decoration: none; font-size: 11px; font-weight: 500; transition: color .15s; }
      .footer-link:hover { color: var(--color-primary); }
    `}</style>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>PhosNet</strong>
        {' '}— 300,038 phosphorylation sites · 44,112 proteins · ≥13 species
      </span>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <a href="/about"          className="footer-link">About</a>
        <a href="/about#citation" className="footer-link">Cite</a>
        <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`} target="_blank" rel="noreferrer" className="footer-link">API Docs</a>
        <a href="https://habdsk.org/" target="_blank" rel="noreferrer" className="footer-link">S-Khan Lab</a>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--color-faint)' }}>&copy; 2026 PhosNet · CC BY 4.0</span>
    </div>
  </footer>
)
