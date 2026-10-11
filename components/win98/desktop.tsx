"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { siteConfig } from "@/lib/config"
import { useCustomStatus } from "@/lib/hooks/use-custom-status"
import { useLastFmStatus } from "@/lib/hooks/use-lastfm-status"
import { RickRollEasterEgg } from "@/components/rickroll-easter-egg"
import { Win98Window } from "./window"
import {
  AboutApp,
  CreditsDialog,
  CsApp,
  LinksApp,
  MusicApp,
  RecycleBinApp,
  ShutdownDialog,
  StatusDot,
  STATUS_STYLE,
  activityText,
  type ShutdownChoice,
  type StatusInfo,
} from "./apps"
import {
  CdIcon,
  ComputerIcon,
  CrosshairIcon,
  FolderIcon,
  GlobeIcon,
  HeartIcon,
  InfoIcon,
  NetworkIcon,
  RecycleBinIcon,
  ShortcutOverlay,
  ShutdownIcon,
  SpeakerIcon,
  StartLogo,
} from "./icons"
import "./win98.css"

type AppId = "about" | "links" | "music" | "cs" | "recycle" | "credits" | "shutdown"

interface AppDef {
  title: string
  icon: (size: number) => ReactNode
  width: number
  dialog?: boolean
  flush?: boolean
  menu?: string[]
}

const EXPLORER_MENU = ["File", "Edit", "View", "Go", "Favorites", "Help"]

const APPS: Record<AppId, AppDef> = {
  about: { title: `About ${siteConfig.name}`, icon: (s) => <ComputerIcon size={s} />, width: 400 },
  links: { title: "Links", icon: (s) => <FolderIcon size={s} />, width: 440, flush: true, menu: EXPLORER_MENU },
  music: { title: "Now Playing", icon: (s) => <CdIcon size={s} />, width: 340 },
  cs: { title: "CS Stats", icon: (s) => <CrosshairIcon size={s} />, width: 360 },
  recycle: { title: "Recycle Bin", icon: (s) => <RecycleBinIcon size={s} />, width: 380, flush: true, menu: EXPLORER_MENU },
  credits: { title: "Credits", icon: (s) => <InfoIcon size={s} />, width: 300, dialog: true },
  shutdown: { title: "Shut Down Windows", icon: (s) => <ShutdownIcon size={s} />, width: 340, dialog: true },
}

interface DesktopIcon {
  key: string
  label: string
  icon: ReactNode
  open?: AppId
  href?: string
  external?: boolean
}

const DESKTOP_ICONS: DesktopIcon[] = [
  { key: "about", label: "My Computer", icon: <ComputerIcon />, open: "about" },
  { key: "links", label: "Links", icon: <FolderIcon />, open: "links" },
  { key: "music", label: "Now Playing", icon: <CdIcon />, open: "music" },
  { key: "cs", label: "CS Stats", icon: <CrosshairIcon />, open: "cs" },
  { key: "socials", label: "Socials", icon: <NetworkIcon />, href: "/socials" },
  { key: "old", label: "Old Site", icon: <GlobeIcon />, href: "/old" },
  { key: "donate", label: "Donate", icon: <HeartIcon />, href: siteConfig.donateUrl, external: true },
  { key: "recycle", label: "Recycle Bin", icon: <RecycleBinIcon />, open: "recycle" },
]

interface Win {
  id: AppId
  x: number
  y: number
  z: number
  minimized: boolean
  maximized: boolean
}

interface Bounds {
  w: number
  h: number
}

/** Below this width windows fill the screen and can't be dragged. */
const COMPACT_BELOW = 640
/** Room kept free on the left so the desktop icons stay visible. */
const ICON_COLUMN = 100

function makeWin(id: AppId, x: number, y: number, z: number): Win {
  return { id, x, y, z, minimized: false, maximized: false }
}

function initialLayout({ w, h }: Bounds): Win[] {
  if (w < COMPACT_BELOW) return [makeWin("about", 0, 0, 3)]

  const gap = 16
  const aboutW = APPS.about.width
  const sideW = APPS.music.width
  if (w >= ICON_COLUMN + aboutW + gap + sideW + gap) {
    // Hug the left so the wallpaper's subject on the right stays visible.
    const left = ICON_COLUMN + gap
    const right = left + aboutW + gap
    const wins = [makeWin("about", left, 24, 3), makeWin("music", right, 24, 2)]
    if (h >= 560) wins.push(makeWin("cs", right, 250, 1))
    return wins
  }

  return [
    makeWin("about", ICON_COLUMN, 16, 2),
    makeWin("music", Math.max(ICON_COLUMN, w - sideW - 16), Math.max(16, h - 260), 1),
  ]
}

function spawnPosition(id: AppId, openCount: number, { w, h }: Bounds) {
  const width = Math.min(APPS[id].width, w - 8)
  if (APPS[id].dialog) {
    return { x: Math.round((w - width) / 2), y: Math.max(16, Math.round(h / 2 - 120)) }
  }
  const step = 26 * (openCount % 6)
  return {
    x: Math.max(0, Math.min(ICON_COLUMN + 20 + step, w - width - 8)),
    y: Math.max(0, Math.min(20 + step, h - 220)),
  }
}

export function Win98Desktop() {
  const router = useRouter()
  const statusHook = useCustomStatus()
  const { track: lastfm, loading: lastfmLoading } = useLastFmStatus()

  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [wins, setWins] = useState<Win[]>([])
  const [startOpen, setStartOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [poweredOff, setPoweredOff] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  const zTop = useRef(10)
  const booted = useRef(false)
  const pointerType = useRef("mouse")
  const desktopRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLDivElement>(null)

  const compact = !!bounds && bounds.w < COMPACT_BELOW

  // Measure the desktop area (viewport minus taskbar).
  useEffect(() => {
    const measure = () => {
      const el = desktopRef.current
      if (el) setBounds({ w: el.clientWidth, h: el.clientHeight })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Open the default windows once we know how big the screen is.
  useEffect(() => {
    if (!bounds || booted.current) return
    booted.current = true
    setWins(initialLayout(bounds))
  }, [bounds])

  // Taskbar clock.
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])

  // Close the Start menu when clicking anywhere else.
  useEffect(() => {
    if (!startOpen) return
    const onDown = (e: PointerEvent) => {
      if (!startRef.current?.contains(e.target as Node)) setStartOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [startOpen])

  const focus = useCallback((id: AppId) => {
    setWins((ws) => {
      const target = ws.find((w) => w.id === id)
      if (!target) return ws
      const top = Math.max(...ws.map((w) => w.z))
      if (target.z === top && !target.minimized) return ws
      const z = ++zTop.current
      return ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w))
    })
  }, [])

  const open = useCallback(
    (id: AppId) => {
      setStartOpen(false)
      setWins((ws) => {
        const z = ++zTop.current
        if (ws.some((w) => w.id === id)) {
          return ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w))
        }
        const pos = spawnPosition(id, ws.length, bounds ?? { w: 1024, h: 700 })
        return [...ws, makeWin(id, pos.x, pos.y, z)]
      })
    },
    [bounds],
  )

  const close = useCallback((id: AppId) => setWins((ws) => ws.filter((w) => w.id !== id)), [])

  const patch = useCallback((id: AppId, changes: Partial<Win>) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...changes } : w)))
  }, [])

  const restart = useCallback(() => {
    setStartOpen(false)
    setSelectedIcon(null)
    if (bounds) setWins(initialLayout(bounds))
  }, [bounds])

  const onShutdown = (choice: ShutdownChoice) => {
    close("shutdown")
    if (choice === "old") router.push("/old")
    else if (choice === "restart") restart()
    else setPoweredOff(true)
  }

  // Esc closes the Start menu, then the Shut Down dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (startOpen) setStartOpen(false)
      else if (wins.some((w) => w.id === "shutdown")) close("shutdown")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [startOpen, wins, close])

  const activate = (icon: DesktopIcon) => {
    if (icon.open) open(icon.open)
    else if (icon.href && icon.external) window.open(icon.href, "_blank", "noopener,noreferrer")
    else if (icon.href) router.push(icon.href)
  }

  const visible = wins.filter((w) => !w.minimized)
  const activeId = visible.length ? visible.reduce((a, b) => (b.z > a.z ? b : a)).id : null
  const shutdownOpen = wins.some((w) => w.id === "shutdown")

  const status: StatusInfo = {
    status: statusHook.status,
    customMessage: statusHook.customMessage,
    activityType: statusHook.activityType,
    activityName: statusHook.activityName,
    episodeInfo: statusHook.episodeInfo,
    seasonInfo: statusHook.seasonInfo,
    startedAt: statusHook.startedAt,
    loading: statusHook.loading,
  }
  const statusLabel = STATUS_STYLE[status.status]?.label ?? "Offline"
  const statusTip = `${siteConfig.name} is ${statusLabel}${activityText(status) ? ` — ${activityText(status)}` : ""}`

  const renderApp = (id: AppId) => {
    switch (id) {
      case "about":
        return <AboutApp status={status} onOpenLinks={() => open("links")} onClose={() => close("about")} />
      case "links":
        return <LinksApp />
      case "music":
        return <MusicApp lastfm={lastfm} loading={lastfmLoading} />
      case "cs":
        return <CsApp />
      case "recycle":
        return <RecycleBinApp />
      case "credits":
        return <CreditsDialog onClose={() => close("credits")} />
      case "shutdown":
        return <ShutdownDialog onConfirm={onShutdown} onCancel={() => close("shutdown")} />
    }
  }

  return (
    <div className="w98">
      <RickRollEasterEgg />

      <div
        ref={desktopRef}
        className="w98-desktop"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("w98-icons")) {
            setSelectedIcon(null)
          }
        }}
      >
        <nav className="w98-icons" aria-label="Desktop">
          {DESKTOP_ICONS.map((icon) => (
            <button
              key={icon.key}
              type="button"
              className={`w98-icon${selectedIcon === icon.key ? " is-selected" : ""}`}
              onPointerDown={(e) => {
                pointerType.current = e.pointerType
              }}
              onClick={(e) => {
                setSelectedIcon(icon.key)
                // Mouse users double-click like on a real desktop; taps and Enter open right away.
                if (e.detail === 0 || pointerType.current !== "mouse") activate(icon)
              }}
              onDoubleClick={() => {
                if (pointerType.current === "mouse") activate(icon)
              }}
            >
              <span className="w98-icon-img">
                {icon.icon}
                {icon.href && <ShortcutOverlay />}
              </span>
              <span className="w98-icon-label">{icon.label}</span>
            </button>
          ))}
        </nav>

        {bounds &&
          wins.map((w) => {
            const app = APPS[w.id]
            return (
              <Win98Window
                key={w.id}
                title={app.title}
                icon={app.icon(16)}
                x={Math.min(w.x, bounds.w - 60)}
                y={Math.min(w.y, bounds.h - 22)}
                z={w.id === "shutdown" ? 8500 : w.z}
                width={app.width}
                hidden={w.minimized}
                active={w.id === activeId}
                maximized={w.maximized}
                dialog={app.dialog}
                compact={compact}
                bounds={bounds}
                flush={app.flush}
                menu={app.menu}
                onFocus={() => focus(w.id)}
                onMove={(x, y) => patch(w.id, { x, y })}
                onMinimize={() => patch(w.id, { minimized: true })}
                onToggleMaximize={() => patch(w.id, { maximized: !w.maximized })}
                onClose={() => close(w.id)}
              >
                {renderApp(w.id)}
              </Win98Window>
            )
          })}

        {shutdownOpen && <div className="w98-dim" aria-hidden="true" />}
      </div>

      <footer className="w98-taskbar">
        <div ref={startRef} style={{ display: "contents" }}>
          <button
            type="button"
            className={`w98-start${startOpen ? " is-pressed" : ""}`}
            aria-haspopup="menu"
            aria-expanded={startOpen}
            onClick={() => setStartOpen((o) => !o)}
          >
            <StartLogo />
            Start
          </button>

          {startOpen && (
            <div className="w98-startmenu" role="menu">
              <button
                type="button"
                className="w98-startmenu-banner"
                tabIndex={-1}
                aria-label="Credits"
                onClick={() => open("credits")}
              >
                <span>
                  <b>{siteConfig.name}</b>
                  <i>98</i>
                </span>
              </button>
              <ul>
                <li>
                  <button type="button" role="menuitem" onClick={() => open("about")}>
                    <ComputerIcon size={24} />
                    <span>
                      <u>A</u>bout {siteConfig.name}
                    </span>
                  </button>
                </li>
                <li>
                  <button type="button" role="menuitem" onClick={() => open("links")}>
                    <FolderIcon size={24} />
                    <span>
                      <u>L</u>inks
                    </span>
                  </button>
                </li>
                <li>
                  <button type="button" role="menuitem" onClick={() => open("music")}>
                    <CdIcon size={24} />
                    <span>
                      <u>N</u>ow Playing
                    </span>
                  </button>
                </li>
                <li>
                  <button type="button" role="menuitem" onClick={() => open("cs")}>
                    <CrosshairIcon size={24} />
                    <span>
                      <u>C</u>S Stats
                    </span>
                  </button>
                </li>
                <li className="sep" role="separator" />
                <li>
                  <a href="/socials" role="menuitem">
                    <NetworkIcon size={24} />
                    <span>
                      <u>S</u>ocials
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/old" role="menuitem">
                    <GlobeIcon size={24} />
                    <span>
                      <u>O</u>ld Site
                    </span>
                  </a>
                </li>
                <li>
                  <a href={siteConfig.donateUrl} target="_blank" rel="noopener noreferrer" role="menuitem">
                    <HeartIcon size={24} />
                    <span>
                      <u>D</u>onate
                    </span>
                  </a>
                </li>
                <li className="sep" role="separator" />
                <li>
                  <button type="button" role="menuitem" onClick={() => open("shutdown")}>
                    <ShutdownIcon size={24} />
                    <span>
                      Sh<u>u</u>t Down...
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <span className="w98-taskbar-sep" aria-hidden="true" />

        <div className="w98-tasks">
          {wins
            .filter((w) => !APPS[w.id].dialog)
            .map((w) => (
              <button
                key={w.id}
                type="button"
                className={`w98-task${w.id === activeId ? " is-active" : ""}`}
                title={APPS[w.id].title}
                onClick={() => (w.id === activeId ? patch(w.id, { minimized: true }) : focus(w.id))}
              >
                {APPS[w.id].icon(16)}
                <span>{APPS[w.id].title}</span>
              </button>
            ))}
        </div>

        <div className="w98-tray">
          {lastfm.isPlaying && lastfm.track && (
            <button
              type="button"
              title={`Now playing: ${lastfm.track.artist} – ${lastfm.track.name}`}
              aria-label="Now playing"
              onClick={() => open("music")}
            >
              <CdIcon size={16} />
            </button>
          )}
          <button type="button" title={statusTip} aria-label={statusTip} onClick={() => open("about")}>
            <StatusDot status={status.status} />
          </button>
          <SpeakerIcon />
          <time title={now?.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}>
            {now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
          </time>
        </div>
      </footer>

      {poweredOff && (
        <div
          className="w98-shutdown-screen"
          role="button"
          tabIndex={0}
          onClick={() => {
            setPoweredOff(false)
            restart()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setPoweredOff(false)
              restart()
            }
          }}
        >
          <div>
            It&apos;s now safe to turn off
            <br />
            your computer.
            <small>Click anywhere to start {siteConfig.name} 98 again</small>
          </div>
        </div>
      )}
    </div>
  )
}
