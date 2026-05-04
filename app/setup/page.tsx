'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const [handle, setHandle] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      handle: handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      display_name: displayName,
      public_profile: isPublic,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>StartupDiary</span>
        </div>

        <h1 className="font-display text-3xl mb-1 text-center">Set up your profile</h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-muted)' }}>
          Almost there — just a couple of things
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>DISPLAY NAME</label>
            <input type="text" className="input-base" placeholder="Alex Chen"
              value={displayName} onChange={e => setDisplayName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>HANDLE</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
              <input type="text" className="input-base pl-7" placeholder="alexchen"
                value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required maxLength={30} />
            </div>
          </div>

          <div className="card p-4 flex items-start gap-3 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
            <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
              style={{ background: isPublic ? '#6366f1' : 'transparent', border: `1.5px solid ${isPublic ? '#6366f1' : 'rgba(255,255,255,0.15)'}` }}>
              {isPublic && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Show my journey publicly</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Your emotional arc (not entries) appears on the landing page for other founders to see.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
            {loading ? 'Saving…' : 'Enter your diary →'}
          </button>
        </form>
      </div>
    </main>
  )
}
