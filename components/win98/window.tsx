"use client"

import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react"
import { CloseGlyph, MaximizeGlyph, MinimizeGlyph, RestoreGlyph } from "./icons"

interface Win98WindowProps {
  title: string
  icon: ReactNode
  x: number
  y: number
  z: number
  width: number
  active: boolean
  maximized: boolean
  /** Minimized windows stay mounted so their state survives. */
  hidden?: boolean
  /** Dialogs only get a close button and can't be maximized. */
  dialog?: boolean
  /** Phones: no dragging, application windows always fill the desktop. */
  compact: boolean
  bounds: { w: number; h: number }
  flush?: boolean
  menu?: string[]
  onFocus: () => void
  onMove: (x: number, y: number) => void
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
  children: ReactNode
}

export function Win98Window({
  title,
  icon,
  x,
  y,
  z,
  width,
  active,
  maximized,
  hidden,
  dialog,
  compact,
  bounds,
  flush,
  menu,
  onFocus,
  onMove,
  onMinimize,
  onToggleMaximize,
  onClose,
  children,
}: Win98WindowProps) {
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)
  const filled = !dialog && maximized && !compact
  const pinned = !dialog && compact
  const w = Math.min(width, bounds.w - 8)

  const onTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (filled || pinned || e.button !== 0) return
    if ((e.target as HTMLElement).closest("button")) return
    drag.current = { px: e.clientX, py: e.clientY, x, y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onTitlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const nx = d.x + e.clientX - d.px
    const ny = d.y + e.clientY - d.py
    // Keep at least part of the title bar reachable.
    onMove(
      Math.round(Math.min(Math.max(nx, 60 - w), bounds.w - 60)),
      Math.round(Math.min(Math.max(ny, 0), bounds.h - 22)),
    )
  }

  const endDrag = () => {
    drag.current = null
  }

  return (
    <section
      role="dialog"
      aria-label={title}
      hidden={hidden}
      className={`w98-window${active ? " is-active" : ""}${filled ? " is-maximized" : ""}${pinned ? " is-pinned" : ""}`}
      style={{
        left: x,
        top: y,
        zIndex: z,
        width: w,
        maxHeight: filled ? undefined : pinned ? bounds.h : Math.max(160, bounds.h - y),
      }}
      onPointerDownCapture={onFocus}
    >
      <div
        className="w98-titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          if (!dialog && !compact && !(e.target as HTMLElement).closest("button")) onToggleMaximize()
        }}
      >
        {!dialog && <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>}
        <span className="w98-titlebar-text">{title}</span>
        <div className="w98-titlebar-controls">
          {!dialog && (
            <>
              <button type="button" aria-label="Minimize" onClick={onMinimize}>
                <MinimizeGlyph />
              </button>
              {!compact && (
                <button type="button" aria-label={maximized ? "Restore" : "Maximize"} onClick={onToggleMaximize}>
                  {maximized ? <RestoreGlyph /> : <MaximizeGlyph />}
                </button>
              )}
            </>
          )}
          <button type="button" className="close" aria-label="Close" onClick={onClose}>
            <CloseGlyph />
          </button>
        </div>
      </div>
      {menu && (
        <div className="w98-menubar" aria-hidden="true">
          {menu.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
      <div className={`w98-window-body${flush ? " flush" : ""}`}>{children}</div>
    </section>
  )
}
