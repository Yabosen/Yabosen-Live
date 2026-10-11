import { NextResponse } from 'next/server'

// GitHub profile, repos, recent activity and the contribution graph for the
// homepage's GitHub window. Works without a token, but anonymous API calls are
// limited to 60/hour per IP (and Vercel IPs are shared), so set GITHUB_TOKEN
// (a fine-grained token with no extra permissions is enough) for reliability.
const USER = 'Yabosen'
const REVALIDATE = 900 // seconds

export interface GithubRepo {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  pushedAt: string
}

export interface GithubEvent {
  text: string
  repo: string
  url: string
  at: string
  /** How many identical events in a row were merged into this one. */
  count: number
}

export interface ContributionDay {
  date: string // YYYY-MM-DD
  level: number // 0-4, GitHub's shading bucket
  count: number
}

export interface GithubData {
  profile: {
    login: string
    name: string | null
    avatarUrl: string
    bio: string | null
    location: string | null
    followers: number
    following: number
    publicRepos: number
    url: string
  } | null
  repos: GithubRepo[]
  stars: number
  events: GithubEvent[]
  contributions: { total: number | null; days: ContributionDay[] } | null
  errors: string[]
}

async function githubApi<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'yabosen.live',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`https://api.github.com${path}`, { headers, next: { revalidate: REVALIDATE } })
  if (!res.ok) throw new Error(`GitHub API ${path} returned ${res.status}`)
  return res.json()
}

function describeEvent(e: any): Omit<GithubEvent, 'at' | 'count'> | null {
  const repo: string = e.repo?.name ?? ''
  const url = `https://github.com/${repo}`
  const p = e.payload ?? {}
  const branch = typeof p.ref === 'string' ? p.ref.replace('refs/heads/', '') : null
  switch (e.type) {
    case 'PushEvent':
      return { text: `Pushed to ${repo}${branch ? ` (${branch})` : ''}`, repo, url }
    case 'CreateEvent':
      return p.ref_type === 'repository'
        ? { text: `Created repository ${repo}`, repo, url }
        : { text: `Created ${p.ref_type} ${p.ref} in ${repo}`, repo, url }
    case 'DeleteEvent':
      return { text: `Deleted ${p.ref_type} ${p.ref} in ${repo}`, repo, url }
    case 'WatchEvent':
      return { text: `Starred ${repo}`, repo, url }
    case 'ForkEvent':
      return { text: `Forked ${repo}`, repo, url: p.forkee?.html_url ?? url }
    case 'PublicEvent':
      return { text: `Made ${repo} public`, repo, url }
    case 'ReleaseEvent':
      return { text: `Released ${p.release?.tag_name ?? 'a version'} of ${repo}`, repo, url: p.release?.html_url ?? url }
    case 'IssuesEvent':
      return { text: `${capitalize(p.action)} issue #${p.issue?.number} in ${repo}`, repo, url: p.issue?.html_url ?? url }
    case 'PullRequestEvent':
      return { text: `${capitalize(p.action)} pull request #${p.pull_request?.number} in ${repo}`, repo, url: p.pull_request?.html_url ?? url }
    case 'IssueCommentEvent':
      return { text: `Commented on #${p.issue?.number} in ${repo}`, repo, url: p.comment?.html_url ?? url }
    default:
      return repo ? { text: `${e.type.replace(/Event$/, '')} in ${repo}`, repo, url } : null
  }
}

function capitalize(s: unknown) {
  return typeof s === 'string' && s ? s[0].toUpperCase() + s.slice(1) : 'Updated'
}

/** Collapses runs of the same event on the same repo ("Pushed to X" ×5). */
function collapse(events: any[]): GithubEvent[] {
  const out: GithubEvent[] = []
  for (const e of events) {
    const d = describeEvent(e)
    if (!d) continue
    const last = out[out.length - 1]
    if (last && last.text === d.text) {
      last.count++
      continue
    }
    out.push({ ...d, at: e.created_at, count: 1 })
  }
  return out
}

/** Scrapes the public contribution calendar (the API needs a token for this). */
async function contributions(): Promise<GithubData['contributions']> {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; yabosen.live)' },
    next: { revalidate: REVALIDATE },
  })
  if (!res.ok) throw new Error(`Contribution graph returned ${res.status}`)
  const html = await res.text()

  const counts = new Map<string, number>()
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^(\d[\d,]*) contributions?/.exec(m[2].trim())
    counts.set(m[1], n ? Number(n[1].replace(/,/g, '')) : 0)
  }

  const days: ContributionDay[] = []
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0]
    const date = /data-date="([^"]+)"/.exec(tag)?.[1]
    const level = /data-level="(\d)"/.exec(tag)?.[1]
    const id = /\bid="([^"]+)"/.exec(tag)?.[1]
    if (!date || level == null) continue
    days.push({ date, level: Number(level), count: (id && counts.get(id)) || 0 })
  }
  days.sort((a, b) => a.date.localeCompare(b.date))

  const totalText = /js-contribution-activity-description[^>]*>\s*([\d,]+)/.exec(html)?.[1]
  const total = totalText ? Number(totalText.replace(/,/g, '')) : null
  return days.length ? { total, days } : null
}

export async function GET() {
  const errors: string[] = []
  const settle = <T,>(p: Promise<T>) =>
    p.catch((err: unknown) => {
      errors.push(err instanceof Error ? err.message : String(err))
      return null
    })

  const [user, repos, events, graph] = await Promise.all([
    settle(githubApi<any>(`/users/${USER}`)),
    settle(githubApi<any[]>(`/users/${USER}/repos?sort=pushed&per_page=100&type=owner`)),
    settle(githubApi<any[]>(`/users/${USER}/events/public?per_page=50`)),
    settle(contributions()),
  ])

  const owned = (repos ?? []).filter((r) => !r.fork && !r.archived)
  const body: GithubData = {
    profile: user
      ? {
          login: user.login,
          name: user.name,
          avatarUrl: user.avatar_url,
          bio: user.bio?.trim() || null,
          location: user.location,
          followers: user.followers,
          following: user.following,
          publicRepos: user.public_repos,
          url: user.html_url,
        }
      : null,
    repos: owned.slice(0, 8).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
    })),
    stars: owned.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0),
    events: collapse(events ?? []).slice(0, 10),
    contributions: graph,
    errors,
  }

  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=3600` },
  })
}
