'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const AudioRecorder = dynamic(() => import('@/components/AudioRecorder'), { ssr: false })

type Mode = 'text' | 'audio'

export default function NewEntryPage() {
  const [mode, setMode] = useState<Mode>('text')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'saving'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 10) {
      setError('Please write at least a sentence or two.')
      return
    }
    setError('')
    setLoading(true)
    setStatus('analyzing')

    try {
      // Get AI analysis
      const analysisRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      let analysis = { mood_score: null, mood_label: null, themes: [], ai_insight: null, is_milestone: false }
      if (analysisRes.ok) {
        analysis = await analysisRes.json()
      }

      setStatus('saving')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { error: insertError } = await supabase.from('diary_entries').insert({
        user_id: user.id,
        content: content.trim(),
        entry_type: mode,
        ...analysis,
      })

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      setStatus('idle')
    }
  }

  const statusLabel = { idle: '', analyzing: 'Reading your entry…', saving: 'Saving to your diary…' }

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
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-2xl">New entry</h1>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
        {(['text', 'audio'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: mode === m ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: mode === m ? '#818cf8' : 'var(--text-muted)',
              border: mode === m ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
            }}>
            {m === 'text' ? '✍️ Text' : '🎙 Audio'}
          </button>
        ))}
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {mode === 'text' ? (
            <textarea
              className="input-base resize-none text-base leading-relaxed"
              style={{ minHeight: '280px', padding: '16px', fontSize: '15px' }}
              placeholder="What's happening in your world today? A decision you're wrestling with, a win worth celebrating, a challenge that's weighing on you…"
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="card rounded-xl" style={{ minHeight: '280px' }}>
              <AudioRecorder onTranscript={text => setContent(text)} />
              {content && (
                <div className="px-6 pb-6">
                  <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>TRANSCRIPT</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{content}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Word count */}
      <p className="text-xs font-mono mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
        {content.trim().split(/\s+/).filter(Boolean).length} words
      </p>

      {/* Error */}
      {error && (
        <p className="text-sm px-3 py-2 rounded-lg mt-3"
          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between mt-6">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{statusLabel[status]}</p>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            AI will analyze mood, themes, and insights
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading || !content.trim()} className="btn-primary px-5 py-2.5 text-sm">
          Analyze & save →
        </button>
      </div>
    </div>
  )
}
