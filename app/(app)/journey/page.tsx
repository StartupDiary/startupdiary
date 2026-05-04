import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import EntryCard from '@/components/EntryCard'

const MoodChart = dynamic(() => import('@/components/MoodChart'), { ssr: false })

export default async function JourneyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allEntries = entries ?? []
  const withMood = allEntries.filter(e => e.mood_score !== null)
  const avgMood = withMood.length > 0
    ? withMood.reduce((s, e) => s + (e.mood_score ?? 0), 0) / withMood.length
    : null

  const milestones = allEntries.filter(e => e.is_milestone)

  // Find best and worst days
  const sortedByMood = [...withMood].sort((a, b) => (b.mood_score ?? 0) - (a.mood_score ?? 0))
  const bestDay = sortedByMood[0]
  const worstDay = sortedByMood[sortedByMood.length - 1]

  // Most common themes
  const themeCounts: Record<string, number> = {}
  allEntries.forEach(e => {
    (e.themes ?? []).forEach((t: string) => { themeCounts[t] = (themeCounts[t] ?? 0) + 1 })
  })
  const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const entriesForDisplay = [...allEntries].reverse()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          {allEntries.length > 0
            ? `${new Date(allEntries[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — present`
            : 'Your story starts here'}
        </p>
        <h1 className="font-display text-3xl">Your journey</h1>
      </div>

      {allEntries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="font-display text-2xl mb-2">No journey yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Write your first entry and your journey will start taking shape.
          </p>
          <Link href="/entry/new" className="btn-primary px-6 py-3 text-sm inline-block">
            Write first entry
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'ENTRIES', value: allEntries.length },
              { label: 'MILESTONES', value: milestones.length },
              { label: 'AVG MOOD', value: avgMood !== null ? (avgMood > 0 ? '+' : '') + avgMood.toFixed(2) : '—' },
              { label: 'TOP THEME', value: topThemes[0]?.[0] ?? '—' },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="font-display text-xl">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Mood chart */}
          <div className="card p-5 mb-6">
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-muted)' }}>EMOTIONAL ARC</p>
            <MoodChart entries={allEntries} />
          </div>

          {/* Top themes */}
          {topThemes.length > 0 && (
            <div className="card p-5 mb-6">
              <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-muted)' }}>YOUR THEMES</p>
              <div className="space-y-2">
                {topThemes.map(([theme, count]) => (
                  <div key={theme} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-24 shrink-0" style={{ color: '#818cf8' }}>{theme}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(count / (topThemes[0]?.[1] ?? 1)) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="mb-8">
              <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-muted)' }}>MILESTONES</p>
              <div className="space-y-3">
                {milestones.reverse().map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {/* Full timeline */}
          <div>
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              FULL TIMELINE · {allEntries.length} entries
            </p>
            <div className="space-y-3">
              {entriesForDisplay.map(entry => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
