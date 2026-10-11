"use client"

import { useEffect, useState } from "react"
import type { ContributionDay, GithubData } from "@/app/api/github/route"
import { ButtonRow, LinkButton, timeAgo, usePolledJson } from "./apps"

const PROFILE_URL = "https://github.com/Yabosen"
const REFRESH_MS = 10 * 60_000

type Tab = "overview" | "repos" | "orgs" | "activity"

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "repos", label: "Repositories" },
  { id: "orgs", label: "Organizations" },
  { id: "activity", label: "Activity" },
]

// Purple take on GitHub's green contribution scale, levels 0-4.
const LEVEL_COLORS = ["var(--w98-field)", "#3b2560", "#5b33a0", "#8a5ad8", "#c9a8ff"]

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#663399",
  Rust: "#dea584",
  Dart: "#00b4ab",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Python: "#3572a5",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Go: "#00add8",
  Lua: "#000080",
  Shell: "#89e051",
  PowerShell: "#012456",
  GDScript: "#355570",
  Zig: "#ec915c",
}

export function GithubApp() {
  const { data, loading, failed } = usePolledJson<GithubData>("/api/github", REFRESH_MS)
  const [tab, setTab] = useState<Tab>("overview")

  return (
    <div>
      <div className="w98-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`w98-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="w98-tabpanel" role="tabpanel">
        {loading && <span>Connecting to GitHub...</span>}
        {failed && <span>Couldn&apos;t reach GitHub right now.</span>}
        {data && tab === "overview" && <Overview data={data} />}
        {data && tab === "repos" && <Repos data={data} />}
        {data && tab === "orgs" && <Orgs data={data} />}
        {data && tab === "activity" && <Activity data={data} />}
      </div>

      <ButtonRow>
        <LinkButton href={PROFILE_URL}>Open GitHub profile</LinkButton>
      </ButtonRow>
      <div className="w98-statusbar" style={{ marginTop: 8 }}>
        <span className="grow">github.com/Yabosen</span>
        <span>{data?.errors.length ? "Partly unavailable" : data ? "Up to date" : "..."}</span>
      </div>
    </div>
  )
}

function Overview({ data }: { data: GithubData }) {
  const p = data.profile
  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div className="w98-sunken" style={{ flexShrink: 0, padding: 2, lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p?.avatarUrl ?? `${PROFILE_URL}.png`} alt="" width={64} height={64} style={{ display: "block" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{p?.name ?? "Yabosen"}</div>
          <div style={{ color: "var(--w98-muted)", marginTop: 2 }}>
            @{p?.login ?? "Yabosen"}
            {p?.location ? ` · ${p.location}` : ""}
          </div>
          {p?.bio && <div style={{ marginTop: 4 }}>{p.bio}</div>}
          {p && (
            <div style={{ marginTop: 6 }}>
              <b>{p.followers}</b> followers · <b>{p.following}</b> following · <b>{p.publicRepos}</b> repos ·{" "}
              <b>{data.stars}</b> stars
            </div>
          )}
        </div>
      </div>

      {data.orgs.length > 0 && (
        <fieldset className="w98-group">
          <legend>Organizations</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.orgs.map((o) => (
              <a
                key={o.login}
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                title={o.description ? `${o.login}: ${o.description}` : o.login}
                className="w98-sunken w98-org-avatar"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sized(o.avatarUrl, 56)} alt={o.login} width={28} height={28} />
              </a>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="w98-group">
        <legend>Contributions</legend>
        {data.contributions ? (
          <ContributionGraph days={data.contributions.days} total={data.contributions.total} />
        ) : (
          <span style={{ color: "var(--w98-muted)" }}>Contribution graph unavailable right now.</span>
        )}
      </fieldset>
    </div>
  )
}

function ContributionGraph({ days, total }: { days: ContributionDay[]; total: number | null }) {
  // Weeks are columns (Sunday on top), like on GitHub.
  const offset = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0
  const weeks = Math.ceil((days.length + offset) / 7)
  const sum = total ?? days.reduce((n, d) => n + d.count, 0)

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <b>{sum.toLocaleString("en-US")}</b> contributions in the last year
      </div>
      <div className="w98-sunken" style={{ padding: 4, background: "var(--w98-field)" }}>
        <div
          className="w98-contrib"
          style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}
          role="img"
          aria-label={`${sum} contributions in the last year`}
        >
          {days.map((d, i) => (
            <span
              key={d.date}
              title={`${d.count || "No"} contribution${d.count === 1 ? "" : "s"} on ${formatDay(d.date)}`}
              style={{
                gridColumn: Math.floor((i + offset) / 7) + 1,
                gridRow: ((i + offset) % 7) + 1,
                background: LEVEL_COLORS[d.level] ?? LEVEL_COLORS[0],
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 4, color: "var(--w98-muted)" }}>
        Less
        {LEVEL_COLORS.map((c) => (
          <span key={c} className="w98-contrib-key" style={{ background: c }} />
        ))}
        More
      </div>
    </div>
  )
}

/** GitHub avatar URL at a given pixel size. */
function sized(url: string, px: number) {
  return `${url}${url.includes("?") ? "&" : "?"}s=${px}`
}

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function Repos({ data }: { data: GithubData }) {
  if (!data.repos.length) return <span style={{ color: "var(--w98-muted)" }}>No public repositories.</span>
  return (
    <div className="w98-listview">
      {data.repos.map((r) => (
        <a key={r.name} className="w98-repo" href={r.url} target="_blank" rel="noopener noreferrer">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <b className="w98-repo-name">{r.name}</b>
            <span style={{ marginLeft: "auto", whiteSpace: "nowrap", color: "var(--w98-muted)" }}>
              {r.stars > 0 && `★ ${r.stars}`}
            </span>
          </div>
          {r.description && <div style={{ color: "var(--w98-muted)" }}>{r.description}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, color: "var(--w98-muted)" }}>
            {r.language && (
              <>
                <span className="w98-lang-dot" style={{ background: LANGUAGE_COLORS[r.language] ?? "#8b8b8b" }} />
                {r.language} ·{" "}
              </>
            )}
            Updated {timeAgo(r.pushedAt)}
          </div>
        </a>
      ))}
    </div>
  )
}

function Orgs({ data }: { data: GithubData }) {
  if (!data.orgs.length) return <span style={{ color: "var(--w98-muted)" }}>No public organizations.</span>
  return (
    <div className="w98-explorer-view" style={{ minHeight: 0 }}>
      {data.orgs.map((o) => (
        <a
          key={o.login}
          href={o.url}
          target="_blank"
          rel="noopener noreferrer"
          title={o.description ?? undefined}
          className="w98-icon on-white"
        >
          <span className="w98-icon-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sized(o.avatarUrl, 64)} alt="" width={32} height={32} style={{ display: "block" }} />
          </span>
          <span className="w98-icon-label" style={{ wordBreak: "break-word" }}>
            {o.login}
          </span>
        </a>
      ))}
    </div>
  )
}

function Activity({ data }: { data: GithubData }) {
  // Re-render every minute so "x min ago" stays right.
  const [, setNow] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!data.events.length) return <span style={{ color: "var(--w98-muted)" }}>No recent public activity.</span>
  return (
    <div className="w98-listview">
      {data.events.map((e) => (
        <a key={`${e.at}-${e.text}`} className="w98-repo" href={e.url} target="_blank" rel="noopener noreferrer">
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ minWidth: 0 }}>
              {e.text}
              {e.count > 1 && <span style={{ color: "var(--w98-muted)" }}> ×{e.count}</span>}
            </span>
            <span style={{ marginLeft: "auto", whiteSpace: "nowrap", color: "var(--w98-muted)" }}>{timeAgo(e.at)}</span>
          </div>
        </a>
      ))}
    </div>
  )
}
