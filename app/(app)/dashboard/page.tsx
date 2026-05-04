import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: entries }] = await Promise.all([
    supabase.from('profiles').select('display_name, handle').eq('id', user.id).single(),
    supabase.from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Founder'
  const allEntries = entries ?? []

  // Stats
  const totalEntries = allEntries.length
  const avgMood = allEntries.filter(e => e.mood_score !== null).length > 0
    ? allEntries.filter(e => e.mood_score !== null).reduce((sum, e) => sum + (e.mood_score ?? 0), 0) / allEntries.filter(e => e.mood_score !== null).length
    : null
  const milestones = allEntries.filter(e => e.is_milestone).length

  function moodToLabel(score: number | null) {
    if (score === null) return '—'
    if (score >= 0.5) return 'High energy'
    if (score >= 0.1) return 'Positive'
    if (score >= -0.1) return 'Neutral'
    if (score >= -0.5) return 'Challenging'
    return 'Tough period'
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{today}</p>
          <h1 className="font-display text-3xl">
            {totalEntries === 0 ? `Welcome, ${displayName.split(' ')[0]}` : `Your diary`}
          </h1>
        </div>
        <Link href="/entry/new" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New entry
        </Link>
      </div>

      {/* Stats */}
      {totalEntries > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'ENTRIES', value: totalEntries },
            { label: 'AVG MOOD', value: moodToLabel(avgMood) },
            { label: 'MILESTONES', value: milestones },
          ].map(stat => (
            <div key={stat.label} className="card p-4">
              <p className="font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className="font-display text-xl">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Entries */}
      {allEntries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">✍️</div>
          <h2 className="font-display text-2xl mb-2">Your first entry awaits</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Document what's on your mind today — the wins, the struggles, the decisions.
          </p>
          <Link href="/entry/new" className="btn-primary px-6 py-3 text-sm inline-block">
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
