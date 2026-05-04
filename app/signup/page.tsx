'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>StartupDiary</span>
        </Link>

        {done ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h1 className="font-display text-3xl mb-2">Check your email</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We sent a confirmation link to <span style={{ color: 'var(--text-secondary)' }}>{email}</span>.
              <br />Click it to activate your account and set up your profile.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl mb-1 text-center">Start your diary</h1>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-muted)' }}>
              Document your founder journey
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>EMAIL</label>
                <input type="email" className="input-base" placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>PASSWORD</label>
                <input type="password" className="input-base" placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" className="underline" style={{ color: 'var(--text-secondary)' }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
