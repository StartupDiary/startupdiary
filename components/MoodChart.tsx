'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Dot,
} from 'recharts'

interface Entry {
  id: string
  created_at: string
  mood_score: number | null
  mood_label: string | null
  is_milestone: boolean | null
}

interface MoodChartProps {
  entries: Entry[]
}

function getMoodColor(score: number) {
  if (score >= 0.3) return '#34d399'
  if (score <= -0.3) return '#f87171'
  return '#94a3b8'
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  if (!payload.mood_score) return null
  const color = getMoodColor(payload.mood_score)
  const isMilestone = payload.is_milestone

  if (isMilestone) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="#6366f1" opacity={0.2} />
        <circle cx={cx} cy={cy} r={5} fill="#6366f1" />
        <circle cx={cx} cy={cy} r={2} fill="#fff" />
      </g>
    )
  }

  return <circle cx={cx} cy={cy} r={3} fill={color} stroke="transparent" />
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  const score = d.mood_score

  return (
    <div className="card px-3 py-2 text-sm" style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
      <p className="font-mono text-xs text-[var(--text-muted)] mb-1">{d.date_label}</p>
      {d.mood_label && (
        <p style={{ color: getMoodColor(score) }} className="font-medium">{d.mood_label}</p>
      )}
      <p className="text-[var(--text-secondary)] text-xs">
        Score: {score > 0 ? '+' : ''}{score?.toFixed(2)}
      </p>
      {d.is_milestone && (
        <p className="text-[#6366f1] text-xs mt-1">⭐ Milestone</p>
      )}
    </div>
  )
}

export default function MoodChart({ entries }: MoodChartProps) {
  const data = entries
    .filter(e => e.mood_score !== null)
    .map(e => ({
      date_label: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood_score: e.mood_score,
      mood_label: e.mood_label,
      is_milestone: e.is_milestone,
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--text-muted)] text-sm">
        Write a few entries to see your mood arc.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="moodLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date_label"
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[-1, 1]}
          ticks={[-1, -0.5, 0, 0.5, 1]}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v > 0 ? `+${v}` : `${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="mood_score"
          stroke="url(#moodLine)"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: '#6366f1', stroke: 'rgba(99,102,241,0.3)', strokeWidth: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
