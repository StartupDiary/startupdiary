import Link from 'next/link'
import dynamic from 'next/dynamic'

const JourneyPaths = dynamic(() => import('@/components/JourneyPaths'), { ssr: false })

async function getPublicJourneys() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/public-journeys`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function LandingPage() {
  const journeys = await getPublicJourneys()

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Full-screen journey paths background */}
      <div className="absolute inset-0 z-0">
        <JourneyPaths journeys={journeys} />
        {/* Radial vignette over paths */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(8,8,14,0.6) 70%, rgba(8,8,14,0.9) 100%)'
        }} />
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <span className="font-mono text-sm font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            StartupDiary
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-4 py-2">
            Start writing
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-pulse" />
          AI DIARY FOR FOUNDERS
        </div>

        <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tight mb-6"
          style={{ maxWidth: '900px' }}>
          Your journey,
          <br />
          <em className="italic" style={{
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            documented.
          </em>
        </h1>

        <p className="text-lg max-w-md leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
          Every decision, every pivot, every breakthrough —
          captured in your voice, understood by AI.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">
            Start your diary
          </Link>
          <Link href="/login" className="btn-ghost px-6 py-3 text-base">
            Sign in
          </Link>
        </div>

        <p className="mt-6 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Free to start · No credit card required
        </p>
      </section>

      {/* Features row */}
      <section className="relative z-10 px-8 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: '🎙',
              title: 'Voice or text',
              desc: 'Record your thoughts out loud or type — your call.',
            },
            {
              icon: '🧠',
              title: 'AI understands context',
              desc: 'Mood, themes, and insights extracted from every entry.',
            },
            {
              icon: '📈',
              title: 'See your arc',
              desc: 'Visualize your emotional journey across weeks and months.',
            },
          ].map(f => (
            <div key={f.title} className="card p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-medium text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
