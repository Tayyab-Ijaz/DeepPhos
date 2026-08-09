import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DBStats, DASEntry } from '../../types'

const TIER_COLORS = { GOLD: '#d97706', SILVER: '#9ca3af', BRONZE: '#b45309' }
const DAS_COLORS  = ['#CBD5E1', '#93C5FD', '#3b82f6', '#1d4ed8']

const TICK_STYLE = { fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #C7D7F9', borderRadius: 8,
      padding: '8px 12px', fontSize: '0.78rem', boxShadow: '0 4px 12px rgba(37,99,235,.12)',
    }}>
      {label !== undefined && <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? '#2563EB', margin: 0 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export const TierPieChart = ({ stats }: { stats: DBStats }) => {
  const data = [
    { name: 'GOLD',   value: stats.gold_sites,   fill: TIER_COLORS.GOLD   },
    { name: 'SILVER', value: stats.silver_sites,  fill: TIER_COLORS.SILVER },
    { name: 'BRONZE', value: stats.bronze_sites,  fill: TIER_COLORS.BRONZE },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%"
             innerRadius={50} outerRadius={76} paddingAngle={2}>
          {data.map(d => <Cell key={d.name} fill={d.fill} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} formatter={(v: number) => v.toLocaleString()} />
        <Legend iconType="circle" iconSize={9}
          formatter={(v) => <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const DASBarChart = ({ data }: { data: DASEntry[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
      <XAxis dataKey="das_score" tickFormatter={v => `DAS ${v}`} tick={TICK_STYLE} axisLine={false} tickLine={false} />
      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={TICK_STYLE} axisLine={false} tickLine={false} width={36} />
      <Tooltip content={<CustomTooltip />} labelFormatter={l => `DAS = ${l}`} formatter={(v: number) => [v.toLocaleString(), 'Sites']} />
      <Bar dataKey="count" radius={[5,5,0,0]} maxBarSize={44}>
        {data.map((_, i) => <Cell key={i} fill={DAS_COLORS[i] ?? '#3b82f6'} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export const SpeciesBarChart = ({ data }: { data: { organism: string; unique_sites: number }[] }) => {
  const top = data
    .filter(d => d.organism)
    .slice(0, 5)
    .map(d => ({ ...d, organism: d.organism.split(' ').slice(0, 2).join(' ') }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={top} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 0 }}>
        <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={TICK_STYLE} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="organism" tick={{ ...TICK_STYLE, fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} formatter={(v: number) => [v.toLocaleString(), 'Sites']} />
        <Bar dataKey="unique_sites" fill="#3b82f6" radius={[0,5,5,0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
