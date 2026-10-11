"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { siteConfig } from "@/lib/config"
import type { StatusType } from "@/lib/hooks/use-custom-status"
import { FolderIcon, InfoIcon, LinkFileIcon, RecycleBinIcon, ShutdownIcon } from "./icons"

// ---------- Shared bits ----------

export const STATUS_STYLE: Record<StatusType, { label: string; color: string }> = {
  online: { label: "Online", color: "#00a000" },
  idle: { label: "Idle", color: "#e0a000" },
  dnd: { label: "Do Not Disturb", color: "#e00000" },
  offline: { label: "Offline", color: "#808080" },
  sleeping: { label: "Sleeping", color: "#8000c0" },
  streaming: { label: "Streaming", color: "#e0007a" },
}

export interface StatusInfo {
  status: StatusType
  customMessage: string | null
  activityType: "playing" | "watching" | null
  activityName: string | null
  episodeInfo: string | null
  seasonInfo: string | null
  startedAt?: number
  loading: boolean
}

export interface LastFmInfo {
  isPlaying: boolean
  track?: { name: string; artist: string; album?: string; albumArt?: string; url?: string }
}

export function activityText(s: StatusInfo): string | null {
  if (!s.activityType || !s.activityName) return null
  if (s.activityType === "playing") {
    return `${s.status === "streaming" ? "Streaming" : "Playing"}: ${s.activityName}`
  }
  const extras = [s.seasonInfo, s.episodeInfo && `Ep ${s.episodeInfo}`].filter(Boolean)
  return `Watching: ${s.activityName}${extras.length ? ` (${extras.join(" ")})` : ""}`
}

function useElapsed(startedAt?: number) {
  const [elapsed, setElapsed] = useState<string | null>(null)
  useEffect(() => {
    if (!startedAt) {
      setElapsed(null)
      return
    }
    const tick = () => {
      const diff = Math.max(0, Date.now() - startedAt)
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      setElapsed(h > 0 ? `${String(h).padStart(2, "0")}:${mmss}` : mmss)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  return elapsed
}

export function StatusDot({ status, size = 10 }: { status: StatusType; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background: STATUS_STYLE[status]?.color ?? "#808080",
        boxShadow: "inset -1px -1px rgba(0,0,0,.45), inset 1px 1px rgba(255,255,255,.6)",
      }}
    />
  )
}

function ButtonRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
      {children}
    </div>
  )
}

function LinkButton({ href, children, internal }: { href: string; children: ReactNode; internal?: boolean }) {
  return (
    <a
      className="w98-btn"
      href={href}
      {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  )
}

// ---------- About (My Computer) ----------

export function AboutApp({
  status,
  onOpenLinks,
  onClose,
}: {
  status: StatusInfo
  onOpenLinks: () => void
  onClose: () => void
}) {
  const [avatar, setAvatar] = useState("/api/avatar")
  const elapsed = useElapsed(status.startedAt)
  const style = STATUS_STYLE[status.status] ?? STATUS_STYLE.offline
  const activity = activityText(status)
  const headline = activity || status.customMessage || style.label

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div className="w98-sunken" style={{ flexShrink: 0, padding: 2, lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={siteConfig.name}
            width={88}
            height={88}
            style={{ objectFit: "cover", display: "block" }}
            onError={() => setAvatar(siteConfig.avatarUrl)}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: "2px 0 4px", fontSize: 22, lineHeight: 1.1, fontWeight: 700 }}>{siteConfig.name}</h1>
          <p style={{ margin: 0 }}>{siteConfig.title}</p>
          <p style={{ margin: "6px 0 0", color: "#404040" }}>{siteConfig.bio}</p>
        </div>
      </div>

      <fieldset className="w98-group">
        <legend>Discord status</legend>
        {status.loading ? (
          <span>Connecting...</span>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot status={status.status} />
              <span style={{ fontWeight: 700 }}>{style.label}</span>
              {elapsed && (activity || status.status === "streaming") && (
                <span className="w98-field" style={{ minHeight: 0, padding: "0 4px", marginLeft: "auto" }}>
                  {elapsed}
                </span>
              )}
            </div>
            {headline !== style.label && <div style={{ marginTop: 4 }}>{headline}</div>}
            {activity && status.customMessage && (
              <div style={{ marginTop: 2, color: "#404040" }}>&ldquo;{status.customMessage}&rdquo;</div>
            )}
          </>
        )}
      </fieldset>

      <fieldset className="w98-group">
        <legend>Registered to</legend>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {siteConfig.personalInfo.map((row) => (
              <tr key={row.label}>
                <td style={{ padding: "1px 10px 1px 0", verticalAlign: "top", whiteSpace: "nowrap" }}>{row.label}:</td>
                <td style={{ padding: "1px 0" }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      <ButtonRow>
        <button type="button" className="w98-btn" onClick={onOpenLinks}>
          Links...
        </button>
        <LinkButton href="/old" internal>
          Old Site
        </LinkButton>
        <button type="button" className="w98-btn is-default" onClick={onClose}>
          OK
        </button>
      </ButtonRow>
    </div>
  )
}

// ---------- Explorer windows (Links, Recycle Bin) ----------

interface ExplorerItem {
  name: string
  href: string
  icon: ReactNode
  internal?: boolean
}

const LINK_ITEMS: ExplorerItem[] = [
  { name: "Twitch", href: "https://www.twitch.tv/yab0sen", icon: <LinkFileIcon color="#9146ff" glyph="T" /> },
  { name: "YouTube", href: "https://www.youtube.com/@Yabosen666", icon: <LinkFileIcon color="#ff0000" glyph="play" /> },
  { name: "Kick", href: "https://kick.com/yabosen", icon: <LinkFileIcon color="#53fc18" glyph="K" glyphColor="#000" /> },
  { name: "TikTok", href: "https://www.tiktok.com/@yabosen56", icon: <LinkFileIcon color="#111" glyph="♪" /> },
  { name: "Instagram", href: "https://www.instagram.com/yabosenfps/", icon: <LinkFileIcon color="#e1306c" glyph="IG" /> },
  { name: "YouTube Music", href: "https://www.youtube.com/@YabosenMusic", icon: <LinkFileIcon color="#cc0000" glyph="♫" /> },
  { name: "Discord", href: "https://discord.com/invite/KuTJPaM8qc", icon: <LinkFileIcon color="#5865f2" glyph="D" /> },
  { name: "All Socials", href: "/socials", internal: true, icon: <FolderIcon /> },
  { name: "More Links", href: "/yabo", internal: true, icon: <FolderIcon /> },
]

function Explorer({ path, icon, items, empty }: { path: string; icon: ReactNode; items: ExplorerItem[]; empty?: string }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="w98-explorer">
      <div className="w98-addressbar">
        <span>Address</span>
        <div className="w98-field">
          {icon}
          <span>{path}</span>
        </div>
      </div>
      <div className="w98-explorer-view" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
        {items.length === 0 && (
          <p style={{ margin: "auto", color: "#808080" }}>{empty}</p>
        )}
        {items.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`w98-icon on-white${selected === item.name ? " is-selected" : ""}`}
            onFocus={() => setSelected(item.name)}
            {...(item.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            <span className="w98-icon-img">{item.icon}</span>
            <span className="w98-icon-label">{item.name}</span>
          </a>
        ))}
      </div>
      <div className="w98-statusbar">
        <span className="grow">{items.length} object(s)</span>
        <span>{selected ?? "My Computer"}</span>
      </div>
    </div>
  )
}

export function LinksApp() {
  return (
    <Explorer
      path={"C:\\Yabosen\\Links"}
      icon={<FolderIcon size={16} />}
      items={LINK_ITEMS}
    />
  )
}

export function RecycleBinApp() {
  return (
    <Explorer
      path="Recycle Bin"
      icon={<RecycleBinIcon size={16} />}
      items={[]}
      empty="This folder is empty."
    />
  )
}

// ---------- Now Playing (Last.fm) ----------

const LASTFM_PROFILE = "https://www.last.fm/user/LutyLutanu606"

export function MusicApp({ lastfm, loading }: { lastfm: LastFmInfo; loading: boolean }) {
  const loadedOnce = useRef(false)
  if (!loading) loadedOnce.current = true
  const track = lastfm.track
  const playing = lastfm.isPlaying && !!track

  return (
    <div>
      <div className="w98-lcd">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 12 }}>
            {!loadedOnce.current ? "LOADING..." : playing ? "\u25B6 PLAYING" : "\u25A0 STOPPED"}
          </span>
          <div className={`w98-eq${playing ? " is-playing" : ""}`} style={{ width: 70 }} aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${600 + ((i * 211) % 500)}ms` }} />
            ))}
          </div>
        </div>
        <div className="w98-marquee" style={{ marginTop: 6, fontSize: 14 }}>
          {track ? (
            <span key={`${track.artist}-${track.name}`}>
              {track.artist} &ndash; {track.name}
              {track.album ? ` \u2022 ${track.album}` : ""}
            </span>
          ) : (
            <span style={{ animation: "none", paddingLeft: 0 }}>
              {loadedOnce.current ? "Not playing anything" : "..."}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
        <div className="w98-sunken" style={{ width: 68, height: 68, flexShrink: 0, display: "grid", placeItems: "center", background: "#000" }}>
          {track?.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.albumArt} alt={track.album || track.name} width={64} height={64} style={{ display: "block", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#00e000", fontSize: 26 }} aria-hidden="true">&#9835;</span>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {track?.name ?? "\u2014"}
          </div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track?.artist ?? ""}</div>
          <div style={{ color: "#404040", marginTop: 2 }}>{playing ? "Scrobbling now" : track ? "Last played" : ""}</div>
        </div>
      </div>

      <ButtonRow>
        {track?.url && <LinkButton href={track.url}>Open track</LinkButton>}
        <LinkButton href={LASTFM_PROFILE}>Last.fm profile</LinkButton>
      </ButtonRow>
    </div>
  )
}

// ---------- CS Stats ----------

interface FaceitData {
  nickname: string
  elo: number
  level: number
}

// Minimum ELO for FACEIT CS2 levels 1..10.
const FACEIT_LEVEL_MIN = [100, 501, 751, 901, 1051, 1201, 1351, 1531, 1751, 2001]

function faceitColor(level: number) {
  if (level >= 10) return { bg: "#fe1f00", fg: "#fff" }
  if (level >= 8) return { bg: "#ff6309", fg: "#fff" }
  if (level >= 4) return { bg: "#ffc800", fg: "#000" }
  if (level >= 2) return { bg: "#1ce400", fg: "#000" }
  return { bg: "#eeeeee", fg: "#000" }
}

export function CsApp() {
  const [data, setData] = useState<FaceitData | null>(null)
  const [state, setState] = useState<"loading" | "ok" | "error">("loading")

  useEffect(() => {
    let cancelled = false
    fetch("/api/faceit")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: FaceitData) => {
        if (cancelled) return
        setData(json)
        setState("ok")
      })
      .catch(() => !cancelled && setState("error"))
    return () => {
      cancelled = true
    }
  }, [])

  let progress = 1
  let toNext: string | null = null
  if (data && data.level < 10) {
    const min = FACEIT_LEVEL_MIN[data.level - 1] ?? 0
    const next = FACEIT_LEVEL_MIN[data.level] ?? min
    progress = Math.min(1, Math.max(0, (data.elo - min) / Math.max(1, next - min)))
    toNext = `${Math.max(0, next - data.elo)} ELO to level ${data.level + 1}`
  }
  const color = faceitColor(data?.level ?? 1)

  return (
    <div>
      <fieldset className="w98-group" style={{ marginTop: 6 }}>
        <legend>FACEIT</legend>
        {state === "loading" && <span>Connecting to FACEIT...</span>}
        {state === "error" && <span>Couldn&apos;t reach FACEIT right now.</span>}
        {state === "ok" && data && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="w98-faceit-badge" style={{ background: color.bg, color: color.fg }}>
                {data.level}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                  {data.elo} <span style={{ fontSize: 11, fontWeight: 400 }}>ELO</span>
                </div>
                <div style={{ marginTop: 3 }}>
                  Level {data.level} &middot; {data.nickname}
                </div>
              </div>
            </div>
            <div className="w98-progress" style={{ marginTop: 10 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <div className="w98-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <div style={{ marginTop: 4 }}>{toNext ?? "Max level reached"}</div>
          </>
        )}
      </fieldset>

      <fieldset className="w98-group">
        <legend>CS2 Wingman</legend>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="w98-sunken" style={{ background: "#202020", padding: 4, lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mg2-icon.png" alt="" width={64} height={26} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontWeight: 700 }}>Master Guardian II</span>
        </div>
      </fieldset>

      <ButtonRow>
        <LinkButton href="https://www.faceit.com/en/players/Yabosen">FACEIT</LinkButton>
        <LinkButton href="https://csstats.gg/player/76561198981651703">CS Stats</LinkButton>
        <LinkButton href="https://leetify.com/@yabosen">Leetify</LinkButton>
        <LinkButton href="https://steamcommunity.com/id/Yabosen/">Steam</LinkButton>
      </ButtonRow>
    </div>
  )
}

// ---------- Dialogs ----------

export function CreditsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "6px 4px 0" }}>
        <InfoIcon />
        <div>
          <p style={{ margin: "0 0 6px", fontWeight: 700 }}>
            {siteConfig.name} 98
          </p>
          <p style={{ margin: 0 }}>Credits: by Fanta/Teri and Bendy</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <button type="button" className="w98-btn is-default" onClick={onClose} autoFocus>
          OK
        </button>
      </div>
    </div>
  )
}

export type ShutdownChoice = "shutdown" | "restart" | "old"

export function ShutdownDialog({ onConfirm, onCancel }: { onConfirm: (c: ShutdownChoice) => void; onCancel: () => void }) {
  const [choice, setChoice] = useState<ShutdownChoice>("shutdown")
  const options: { value: ShutdownChoice; label: string }[] = [
    { value: "shutdown", label: "Shut down" },
    { value: "restart", label: "Restart" },
    { value: "old", label: "Restart in old-site mode" },
  ]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onConfirm(choice)
      }}
    >
      <div style={{ display: "flex", gap: 14, padding: "6px 4px 0" }}>
        <ShutdownIcon />
        <div>
          <p style={{ margin: "0 0 8px" }}>What do you want the computer to do?</p>
          {options.map((o) => (
            <label key={o.value} className="w98-radio">
              <input
                type="radio"
                name="shutdown"
                value={o.value}
                checked={choice === o.value}
                onChange={() => setChoice(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 14 }}>
        <button type="submit" className="w98-btn is-default" autoFocus>
          OK
        </button>
        <button type="button" className="w98-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
