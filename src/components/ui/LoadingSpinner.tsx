export const LoadingSpinner = ({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) => {
  const px = { sm: 20, md: 30, lg: 44 }[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0', color: 'var(--color-faint)' }}>
      <div style={{
        width: px, height: px, borderRadius: '50%',
        border: `2px solid var(--color-border-blue)`,
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.7s linear infinite',
      }} />
      {label && (
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-muted)', margin: 0 }}>
          {label}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export const ErrorBox = ({ message }: { message: string }) => (
  <div style={{
    border: '1.5px solid #FCA5A5', background: '#FEF2F2',
    borderRadius: 12, padding: '16px 20px',
  }}>
    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#DC2626', marginBottom: 4, marginTop: 0 }}>
      Something went wrong
    </p>
    <p style={{ fontSize: '0.8125rem', color: '#EF4444', margin: 0 }}>{message}</p>
  </div>
)
