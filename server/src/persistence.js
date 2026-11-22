import { createClient } from '@supabase/supabase-js'

export async function saveGuideForSession(authorization, query, guide, options = {}) {
  const match = /^Bearer\s+(.+)$/i.exec(authorization || '')
  if (!match) return { status: 'anonymous' }

  const url = options.url ?? process.env.SUPABASE_URL
  const key = options.key ?? process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return { status: 'unavailable' }

  const client = (options.createClient ?? createClient)(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${match[1]}` } },
  })
  const { data: userData, error: authError } = await client.auth.getUser(match[1])
  if (authError || !userData?.user?.id) return { status: 'invalid' }

  const { data, error } = await client.rpc('save_wellness_guide', {
    p_query: query,
    p_guide: {
      summary: guide.summary,
      safety_note: guide.safetyNote,
      model_version: guide.modelVersion,
      remedies: guide.remedies.map(({ title, summary, ingredients, steps, usage, precautions }) => ({ title, summary, ingredients, steps, usage, precautions })),
      yoga: guide.yoga.map(({ title, summary, durationMinutes, steps, precautions }) => ({ title, summary, duration_minutes: durationMinutes, steps, precautions })),
      videos: guide.videos.map(({ id, title, channel, thumbnailUrl, duration }) => ({ id, title, channel, thumbnail_url: thumbnailUrl, duration })),
    },
  })
  if (error) throw error
  if (!data?.searchId) throw new Error('Guide persistence returned no search ID.')
  return {
    status: 'saved',
    searchId: data.searchId,
    remedies: data.remedyIds || [],
    yoga: data.yogaIds || [],
  }
}
