import { NextResponse } from 'next/server'

const PROMPT = (content: string) => `You are analyzing a diary entry from a startup founder or entrepreneur.

Extract the following and return ONLY valid JSON (no markdown, no code blocks):

{
  "mood_score": <float from -1.0 to 1.0, where -1 is extremely distressed and 1 is extremely energized/happy>,
  "mood_label": <one word: "Excited", "Motivated", "Hopeful", "Confident", "Neutral", "Uncertain", "Anxious", "Frustrated", "Exhausted", or "Overwhelmed">,
  "themes": [<2-5 strings from this list: "fundraising", "hiring", "product", "growth", "revenue", "churn", "team", "pivot", "launch", "marketing", "investors", "burnout", "customers", "competition", "milestone", "strategy", "operations", "culture", "vision", "personal">],
  "ai_insight": "<one powerful, specific sentence that captures a key tension, decision, or pattern worth reflecting on>",
  "is_milestone": <true if the entry describes a significant milestone such as a funding round, product launch, first paying customer, key hire, hitting a revenue target, or major partnership; otherwise false>
}

Diary entry:
"""
${content}
"""`

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ error: 'Content too short' }, { status: 400 })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://startupdiary.app',
        'X-Title': 'StartupDiary',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: PROMPT(content) }],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter error:', await response.text())
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content ?? ''

    // Strip possible markdown code fences
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()

    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      mood_score: typeof parsed.mood_score === 'number' ? Math.max(-1, Math.min(1, parsed.mood_score)) : 0,
      mood_label: typeof parsed.mood_label === 'string' ? parsed.mood_label : 'Neutral',
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : [],
      ai_insight: typeof parsed.ai_insight === 'string' ? parsed.ai_insight : '',
      is_milestone: Boolean(parsed.is_milestone),
    })
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
