'use client'

import Link from 'next/link'

interface Entry {
  id: string
  content: string
  entry_type: string
  mood_score: number | null
  mood_label: string | null
  themes: string[] | null
  is_milestone: boolean | null
  created_at: string
}

function moodEmoji(score: number | null, label: string | null) {
  if (score === null) return '📝'
  if (score >= 0.6) return '🚀'
  if (score >= 0.3) return '😊'
  if (score >= -0.1) return '😐'
  if (score >= -0.5) return '😟'
  return '😣'
}

function moodColor(score: number | null) {
  if (score === null) return 'var(--neutral)'
  if (score >= 0.3) return 'var(--positive)'
  if (score <= -0.3) return 'var(--negative)'
  return 'var(--neutral)'
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const preview = entry.entry_type === 'audio'
    ? '🎙 Audio entry'
    : entry.content.slice(0, 120).replace(/\n/g, ' ') + (entry.content.length > 120 ? '…' : '')

  const date = new Date(entry.created_at)
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link href={`/entry/${entry.id}`}>
      <div className="card p-4 cursor-pointer transition-all duration-200 hover:translate-y-[-1px]"
        style={{ borderColor: entry.is_milestone ? 'rgba(99,102,241,0.3)' : undefined }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {entry.is_milestone && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                  ⭐ milestone
                </span>
              )}
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {dateStr} · {timeStr}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {preview}
            </p>
            {entry.themes && entry.themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {entry.themes.slice(0, 4).map(theme => (
                  <span key={theme} className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xl">{moodEmoji(entry.mood_score, entry.mood_label)}</span>
            {entry.mood_label && (
              <span className="text-xs font-mono" style={{ color: moodColor(entry.mood_score) }}>
                {entry.mood_label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
