import { NextResponse } from 'next/server'
import { siteConfig } from '@/lib/config'

// Leetify's public CS API. Works without a key; set LEETIFY_API_KEY
// (from https://leetify.com/app/developer) for higher rate limits.
const LEETIFY_PROFILE_URL = 'https://api-public.cs-prod.leetify.com/v3/profile'

interface LeetifyProfile {
  name?: string
  ranks?: {
    leetify?: number | null
    premier?: number | null
    faceit?: number | null
    faceit_elo?: number | null
    wingman?: number | null
    competitive?: { map_name: string; rank: number }[]
  }
  recent_matches?: { finished_at?: string }[]
}

export interface Cs2Ranks {
  premier: number | null
  wingman: number | null
  competitive: { map: string; rank: number }[]
  faceit: { level: number; elo: number | null } | null
  leetifyRating: number | null
  lastMatchAt: string | null
}

export async function GET() {
  const headers: Record<string, string> = { accept: 'application/json' }
  if (process.env.LEETIFY_API_KEY) headers['_leetify_key'] = process.env.LEETIFY_API_KEY

  try {
    const res = await fetch(`${LEETIFY_PROFILE_URL}?steam64_id=${siteConfig.csStats.steam64}`, {
      headers,
      next: { revalidate: 300 }, // Leetify picks up new matches within minutes
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Leetify data' }, { status: 502 })
    }

    const data: LeetifyProfile = await res.json()
    const ranks = data.ranks ?? {}

    const body: Cs2Ranks = {
      premier: ranks.premier || null,
      wingman: ranks.wingman || null,
      competitive: (ranks.competitive ?? [])
        .filter((c) => c.rank > 0)
        .sort((a, b) => b.rank - a.rank)
        .map((c) => ({ map: c.map_name, rank: c.rank })),
      faceit: ranks.faceit ? { level: ranks.faceit, elo: ranks.faceit_elo ?? null } : null,
      leetifyRating: ranks.leetify ?? null,
      lastMatchAt: data.recent_matches?.[0]?.finished_at ?? null,
    }

    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (error) {
    console.error('Leetify API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
