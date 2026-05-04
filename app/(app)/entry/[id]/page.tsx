import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function moodColor(score: number | null) {
  if (score === null) return 'var(--neutral)'
  if (score >= 0.3) return 'var(--positive)'
  if (score <= -0.3) return 'var(--negative)'
  return 'var(--neutral)'
}

function moodEmoji(score: number | null) {
  if (score === null) return '📝'
  if (score >= 0.6) return '🚀'
  if (score >= 0.3) return '😊'
  if (score >= -0.1) return '😐'
  if (score >= -0.5) return '😟'
  return '😣'
}

export default async function EntryPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !entry) notFound()

  const date = new Date(entry.created_at)
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{dateStr} · {timeStr}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {entry.is_milestone && (
              <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                ⭐ milestone
              </span>
            )}
            {entry.entry_type === 'audio' && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>🎙 audio</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Entry content */}
        <div className="card p-6">
          <p className="text-base leading-[1.8] whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
            {entry.content}
          </p>
        </div>

        {/* AI Analysis */}
        {(entry.mood_label || entry.themes?.length > 0 || entry.ai_insight) && (
          <div className="card p-6" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-muted)' }}>AI ANALYSIS</p>

            <div className="space-y-5">
              {/* Mood */}
              {entry.mood_label && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{moodEmoji(entry.mood_score)}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: moodColor(entry.mood_score) }}>
                      {entry.mood_label}
                    </p>
                    {entry.mood_score !== null && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${((entry.mood_score + 1) / 2) * 100}%`,
                              background: entry.mood_score >= 0 ? 'var(--positive)' : 'var(--negative)',
                            }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {entry.mood_score > 0 ? '+' : ''}{entry.mood_score?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Themes */}
              {entry.themes && entry.themes.length > 0 && (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>THEMES</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.themes.map((theme: string) => (
                      <span key={theme} className="text-xs px-2.5 py-1 rounded-lg font-mono"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight */}
              {entry.ai_insight && (
                <div className="pl-4" style={{ borderLeft: '2px solid rgba(99,102,241,0.3)' }}>
                  <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>INSIGHT</p>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    "{entry.ai_insight}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
