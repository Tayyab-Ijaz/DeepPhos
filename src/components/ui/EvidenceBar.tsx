/**
 * Visual DAS bar — shows which source databases a site was found in.
 */
const DB_LABELS: Record<string, { label: string; color: string }> = {
  PhosphoSitePlus:    { label: 'PSP',   color: 'bg-blue-500' },
  'Phospho.ELM':      { label: 'ELM',   color: 'bg-purple-500' },
  PTMS_dataset:       { label: 'PTMS',  color: 'bg-green-500' },
  DbPAF_SysPTM_other: { label: 'Other', color: 'bg-gray-400' },
}

export const EvidenceBar = ({ sources, pds }: { sources: string[]; pds: number }) => (
  <div className="space-y-1">
    <div className="flex flex-wrap gap-1">
      {sources.map(src => {
        const meta = DB_LABELS[src] ?? { label: src, color: 'bg-gray-400' }
        return (
          <span key={src}
            className={`${meta.color} text-white text-xs px-2 py-0.5 rounded font-medium`}>
            {meta.label}
          </span>
        )
      })}
      {sources.length === 0 && (
        <span className="text-gray-400 text-xs">No source tag</span>
      )}
    </div>
    <p className="text-xs text-gray-500">{pds} publication{pds !== 1 ? 's' : ''}</p>
  </div>
)
