export const tierColor = (tier: string) => ({
  GOLD:   'bg-amber-100 text-amber-800 border-amber-300',
  SILVER: 'bg-gray-100 text-gray-700 border-gray-300',
  BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
}[tier] ?? 'bg-gray-100 text-gray-600')

export const tierDot = (tier: string) => ({
  GOLD:   'bg-amber-400',
  SILVER: 'bg-gray-400',
  BRONZE: 'bg-orange-400',
}[tier] ?? 'bg-gray-300')

export const residueColor = (res: string) => ({
  S: 'text-blue-600 bg-blue-50',
  T: 'text-green-600 bg-green-50',
  Y: 'text-purple-600 bg-purple-50',
}[res] ?? 'text-gray-600 bg-gray-50')

export const dasColor = (das: number) => {
  if (das >= 3) return 'text-emerald-700 bg-emerald-50'
  if (das === 2) return 'text-blue-700 bg-blue-50'
  if (das === 1) return 'text-amber-700 bg-amber-50'
  return 'text-gray-500 bg-gray-50'
}

export const fmtNumber = (n: number) => n.toLocaleString()

export const pubmedUrl = (pmid: number | string) =>
  `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`

export const uniprotUrl = (id: string) =>
  `https://www.uniprot.org/uniprotkb/${id}/entry`

export const parseTsv = (text: string): { uniprot_id: string; position: number }[] => {
  const lines = text.trim().split('\n').filter(l => l && !l.startsWith('#'))
  return lines.map(line => {
    const [col1, col2] = line.split(/[\t,]/).map(s => s.trim())
    // Support both "Q96B97  230" and "Q96B97-S230" formats
    if (col2) return { uniprot_id: col1, position: parseInt(col2) }
    const m = col1.match(/^([A-Z0-9]+)-[STY]?(\d+)$/i)
    if (m) return { uniprot_id: m[1], position: parseInt(m[2]) }
    return { uniprot_id: col1, position: NaN }
  }).filter(r => !isNaN(r.position))
}
