'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AudioRecorderProps {
  onTranscript: (text: string) => void
}

type RecordState = 'idle' | 'recording' | 'transcribing'

export default function AudioRecorder({ onTranscript }: AudioRecorderProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        await transcribe(blob, ext)
      }

      recorder.start()
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setState('transcribing')
  }

  const transcribe = async (blob: Blob, ext: string) => {
    try {
      const form = new FormData()
      form.append('audio', blob, `recording.${ext}`)

      const res = await fetch('/api/transcribe', { method: 'POST', body: form })
      if (!res.ok) throw new Error()

      const { text } = await res.json()
      onTranscript(text)
    } catch {
      setError('Transcription failed. Please try again.')
    } finally {
      setState('idle')
      setSeconds(0)
    }
  }

  const toggle = () => {
    if (state === 'idle') startRecording()
    else if (state === 'recording') stopRecording()
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative">
        <AnimatePresence>
          {state === 'recording' && (
            <>
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(239,68,68,0.15)' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(239,68,68,0.08)' }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
            </>
          )}
        </AnimatePresence>

        <motion.button onClick={toggle} whileTap={{ scale: 0.95 }} disabled={state === 'transcribing'}
          className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: state === 'recording'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : state === 'transcribing'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(99,102,241,0.12)',
            border: `2px solid ${state === 'recording' ? '#ef4444' : state === 'transcribing' ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.25)'}`,
            boxShadow: state === 'recording' ? '0 0 30px rgba(239,68,68,0.35)' : 'none',
          }}>
          {state === 'transcribing' ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
          ) : state === 'recording' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="4" height="12" rx="1" />
              <rect x="14" y="6" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </motion.button>
      </div>

      <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
        {state === 'recording'
          ? `Recording ${fmt(seconds)} — tap to stop`
          : state === 'transcribing'
          ? 'Transcribing your audio…'
          : 'Tap to start recording'}
      </p>

      {error && (
        <p className="text-sm text-center max-w-xs px-3 py-2 rounded-lg"
          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
