import { clsx } from 'clsx'
import type { ResidueType } from '../../types'
import { tierColor, residueColor, dasColor } from '../../utils/format'

export const TierBadge = ({ tier }: { tier: string }) => (
  <span className={clsx('inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border', tierColor(tier))}>
    {tier}
  </span>
)

export const ResidueBadge = ({ type }: { type: string }) => (
  <span className={clsx(
    'inline-flex items-center justify-center h-6 w-6 text-[11px] font-mono font-bold rounded-md',
    residueColor(type as ResidueType),
  )}>
    {type}
  </span>
)

export const DASBadge = ({ das }: { das: number }) => (
  <span className={clsx('inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md', dasColor(das))}>
    {das}/3
  </span>
)

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    KNOWN:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    NOVEL:     'bg-blue-50  text-blue-700  border-blue-200',
    NOT_FOUND: 'bg-gray-50   text-gray-500   border-gray-200',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border',
      styles[status] ?? 'bg-gray-50 text-gray-500 border-gray-200')}>
      {status}
    </span>
  )
}
