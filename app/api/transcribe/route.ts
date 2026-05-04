import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 })
    }

    const whisperForm = new FormData()
    whisperForm.append('file', audio)
    whisperForm.append('model', 'whisper-1')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: whisperForm,
    })

    if (!res.ok) {
      console.error('Whisper error:', await res.text())
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ text: data.text })
  } catch (err) {
    console.error('Transcribe error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
