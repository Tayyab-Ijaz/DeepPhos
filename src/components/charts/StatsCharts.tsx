import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DBStats, DASEntry } from '../../types'

const TIER_COLORS = { GOLD: '#d97706', SILVER: '#9ca3af', BRONZE: '#b45309' }
const DAS_COLORS  = ['#e5e7eb', '#93c5fd', '#3b82f6', '#1d4ed8']

export const TierPieChart = ({ stats }: { stats: DBStats }) => {
  const data = [
    { name: 'GOLD',   value: stats.gold_sites,   fill: TIER_COLORS.GOLD   },
    { name: 'SILVER', value: stats.silver_sites,  fill: TIER_COLORS.SILVER },
    { name: 'BRONZE', value: stats.bronze_sites,  fill: TIER_COLORS.BRONZE },
  ]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
             innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map(d => <Cell key={d.name} fill={d.fill} />)}
        </Pie>
        <Tooltip formatter={(v: number) => v.toLocaleString()} />
        <Legend iconType="circle" iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const DASBarChart = ({ data }: { data: DASEntry[] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
      <XAxis dataKey="das_score" tickFormatter={v => `DAS ${v}`} tick={{ fontSize: 12 }} />
      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
      <Tooltip
        formatter={(v: number) => [v.toLocaleString(), 'Sites']}
        labelFormatter={l => `DAS = ${l}`}
      />
      <Bar dataKey="count" radius={[4,4,0,0]}>
        {data.map((_, i) => <Cell key={i} fill={DAS_COLORS[i] ?? '#3b82f6'} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export const SpeciesBarChart = ({ data }: {
  data: { organism: string; unique_sites: number }[]
}) => {
  const top = data
    .filter(d => d.organism)
    .slice(0, 6)
    .map(d => ({ ...d, organism: d.organism.split(' ').slice(0,2).join(' ') }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top} layout="vertical" margin={{ left: 90, right: 16 }}>
        <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="organism" tick={{ fontSize: 11 }} width={85} />
        <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Sites']} />
        <Bar dataKey="unique_sites" fill="#3b82f6" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
