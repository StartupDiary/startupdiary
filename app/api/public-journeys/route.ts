import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all public profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, handle')
      .eq('public_profile', true)
      .limit(8)

    if (profilesError || !profiles || profiles.length === 0) {
      return NextResponse.json([])
    }

    const journeys = await Promise.all(
      profiles.map(async (profile) => {
        const { data: entries } = await supabase
          .from('diary_entries')
          .select('created_at, mood_score')
          .eq('user_id', profile.id)
          .not('mood_score', 'is', null)
          .order('created_at', { ascending: true })
          .limit(30)

        const points = (entries ?? []).map(e => ({
          date: e.created_at,
          mood_score: e.mood_score as number,
        }))

        return { handle: profile.handle, points }
      })
    )

    // Only include users who have at least 2 mood data points
    return NextResponse.json(journeys.filter(j => j.points.length >= 2))
  } catch (error) {
    console.error('Public journeys error:', error)
    return NextResponse.json([])
  }
}
