// Hand-drawn pixel icons in the spirit of Windows 9x. All drawn on a 32x32
// grid with crisp edges so they stay sharp at 16, 24 and 32px.

import type { ReactNode } from "react"

interface IconProps {
  size?: number
}

function Svg({ size = 32, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className="pixel"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ComputerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* monitor */}
      <rect x="4" y="2" width="24" height="19" fill="#000" />
      <rect x="5" y="3" width="22" height="17" fill="#dfdfdf" />
      <rect x="6" y="4" width="21" height="16" fill="#c0c0c0" />
      <rect x="7" y="5" width="18" height="12" fill="#808080" />
      <rect x="8" y="6" width="17" height="11" fill="#000" />
      <rect x="9" y="7" width="15" height="9" fill="#008080" />
      <rect x="10" y="8" width="5" height="1" fill="#7fe0e0" />
      <rect x="10" y="10" width="3" height="1" fill="#7fe0e0" />
      <rect x="22" y="18" width="2" height="1" fill="#00c000" />
      {/* neck */}
      <rect x="12" y="21" width="8" height="2" fill="#000" />
      <rect x="13" y="21" width="6" height="1" fill="#808080" />
      {/* base unit */}
      <rect x="2" y="23" width="28" height="7" fill="#000" />
      <rect x="3" y="24" width="26" height="5" fill="#c0c0c0" />
      <rect x="3" y="24" width="26" height="1" fill="#fff" />
      <rect x="17" y="26" width="9" height="1" fill="#000" />
      <rect x="6" y="26" width="2" height="2" fill="#00c000" />
    </Svg>
  )
}

export function FolderIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 6h11l2 2h15v21H2z" fill="#000" />
      <path d="M3 7h9l2 2h15v19H3z" fill="#c8a000" />
      <rect x="3" y="12" width="26" height="1" fill="#000" />
      <rect x="3" y="13" width="26" height="15" fill="#ffe36b" />
      <rect x="3" y="13" width="26" height="1" fill="#fff6b8" />
      <rect x="3" y="13" width="1" height="15" fill="#fff6b8" />
    </Svg>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="16" cy="16" r="14" fill="#000" />
      <circle cx="16" cy="16" r="13" fill="#1e7fe0" />
      <path d="M8 7h6v3h3v4h-4v4h-3v5H8v-4H5v-6h3z" fill="#2fa84f" />
      <path d="M19 6h5v3h3v5h-3v-2h-3v-3h-2z" fill="#2fa84f" />
      <path d="M18 18h6v3h-2v4h-4v-3h-2v-2h2z" fill="#2fa84f" />
      <rect x="9" y="6" width="3" height="1" fill="#9be7a8" />
      <rect x="20" y="7" width="2" height="1" fill="#9be7a8" />
      <rect x="7" y="5" width="2" height="2" fill="#8fd0ff" />
    </Svg>
  )
}

export function NetworkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* cable */}
      <rect x="8" y="17" width="1" height="11" fill="#000" />
      <rect x="8" y="27" width="17" height="1" fill="#000" />
      <rect x="24" y="23" width="1" height="5" fill="#000" />
      {/* left monitor */}
      <rect x="1" y="3" width="16" height="13" fill="#000" />
      <rect x="2" y="4" width="14" height="11" fill="#c0c0c0" />
      <rect x="4" y="6" width="10" height="7" fill="#000" />
      <rect x="5" y="7" width="8" height="5" fill="#008080" />
      <rect x="5" y="16" width="8" height="2" fill="#000" />
      {/* right monitor */}
      <rect x="15" y="10" width="16" height="13" fill="#000" />
      <rect x="16" y="11" width="14" height="11" fill="#c0c0c0" />
      <rect x="18" y="13" width="10" height="7" fill="#000" />
      <rect x="19" y="14" width="8" height="5" fill="#7c3aed" />
      <rect x="20" y="15" width="3" height="1" fill="#e9d5ff" />
    </Svg>
  )
}

export function CdIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="15" cy="15" r="13" fill="#000" />
      <circle cx="15" cy="15" r="12" fill="#d8d8d8" />
      <path d="M15 3a12 12 0 0 1 12 12h-8a4 4 0 0 0-4-4z" fill="#b6e3ff" />
      <path d="M3 15a12 12 0 0 0 12 12v-8a4 4 0 0 1-4-4z" fill="#ffd6f2" />
      <circle cx="15" cy="15" r="4" fill="#808080" />
      <circle cx="15" cy="15" r="2" fill="#fff" />
      {/* note */}
      <rect x="25" y="14" width="2" height="12" fill="#000" />
      <rect x="27" y="14" width="3" height="2" fill="#000" />
      <rect x="27" y="16" width="2" height="1" fill="#000" />
      <rect x="21" y="24" width="5" height="4" fill="#000" />
      <rect x="22" y="25" width="3" height="2" fill="#7c3aed" />
    </Svg>
  )
}

export function CrosshairIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="16" cy="16" r="12" fill="#000" />
      <circle cx="16" cy="16" r="10" fill="#fff" />
      <circle cx="16" cy="16" r="8" fill="#000" />
      <circle cx="16" cy="16" r="7" fill="#e7e7e7" />
      <rect x="15" y="1" width="2" height="11" fill="#00b000" />
      <rect x="15" y="20" width="2" height="11" fill="#00b000" />
      <rect x="1" y="15" width="11" height="2" fill="#00b000" />
      <rect x="20" y="15" width="11" height="2" fill="#00b000" />
      <rect x="15" y="15" width="2" height="2" fill="#e00000" />
    </Svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M6 6h7v2h2v2h2V8h2V6h7v2h2v9h-2v2h-2v2h-2v2h-2v2h-2v2h-4v-2h-2v-2h-2v-2H8v-2H6v-2H4V8h2z"
        fill="#000"
      />
      <path
        d="M7 7h5v2h2v2h4V9h2V7h5v2h2v7h-2v2h-2v2h-2v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2H9v-2H7v-2H5V9h2z"
        fill="#e00020"
      />
      <rect x="8" y="9" width="3" height="2" fill="#ff9aa8" />
      <rect x="7" y="11" width="2" height="2" fill="#ff9aa8" />
    </Svg>
  )
}

export function RecycleBinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6" y="5" width="20" height="4" fill="#000" />
      <rect x="7" y="6" width="18" height="2" fill="#dfdfdf" />
      <rect x="13" y="3" width="6" height="2" fill="#000" />
      <path d="M8 9h16l-2 20H10z" fill="#000" />
      <path d="M9 10h14l-2 18h-10z" fill="#c0c0c0" />
      <rect x="12" y="11" width="1" height="16" fill="#808080" />
      <rect x="16" y="11" width="1" height="16" fill="#808080" />
      <rect x="20" y="11" width="1" height="16" fill="#808080" />
      <rect x="10" y="11" width="1" height="15" fill="#fff" />
      <rect x="9" y="15" width="14" height="1" fill="#808080" />
      <rect x="10" y="21" width="12" height="1" fill="#808080" />
    </Svg>
  )
}

/** A grass block, front face. */
export function GrassBlockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="26" height="26" fill="#000" />
      {/* dirt */}
      <rect x="4" y="4" width="24" height="24" fill="#8b5a2b" />
      <rect x="7" y="17" width="2" height="2" fill="#6b4220" />
      <rect x="14" y="21" width="2" height="2" fill="#6b4220" />
      <rect x="21" y="16" width="2" height="2" fill="#6b4220" />
      <rect x="10" y="24" width="2" height="2" fill="#a5713d" />
      <rect x="23" y="23" width="2" height="2" fill="#a5713d" />
      <rect x="17" y="18" width="2" height="1" fill="#a5713d" />
      {/* grass with a ragged edge */}
      <rect x="4" y="4" width="24" height="8" fill="#5da130" />
      <rect x="4" y="12" width="3" height="2" fill="#5da130" />
      <rect x="9" y="12" width="2" height="3" fill="#5da130" />
      <rect x="13" y="12" width="4" height="2" fill="#5da130" />
      <rect x="19" y="12" width="2" height="3" fill="#5da130" />
      <rect x="23" y="12" width="5" height="2" fill="#5da130" />
      <rect x="4" y="4" width="24" height="2" fill="#7cc242" />
      <rect x="8" y="7" width="2" height="2" fill="#4a8526" />
      <rect x="18" y="8" width="2" height="2" fill="#4a8526" />
      <rect x="24" y="6" width="2" height="2" fill="#7cc242" />
    </Svg>
  )
}

/** A git branch graph on a dark tile. */
export function GitHubIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="26" height="26" fill="#000" />
      <rect x="4" y="4" width="24" height="24" fill="#24292f" />
      <rect x="4" y="4" width="24" height="1" fill="#57606a" />
      <rect x="4" y="4" width="1" height="24" fill="#57606a" />
      {/* main line */}
      <rect x="11" y="9" width="2" height="14" fill="#c9a8ff" />
      {/* branch curving off to the right */}
      <rect x="13" y="17" width="3" height="2" fill="#c9a8ff" />
      <rect x="16" y="15" width="2" height="2" fill="#c9a8ff" />
      <rect x="18" y="13" width="2" height="2" fill="#c9a8ff" />
      {/* commits */}
      <rect x="9" y="6" width="6" height="5" fill="#000" />
      <rect x="10" y="7" width="4" height="3" fill="#e8defa" />
      <rect x="9" y="22" width="6" height="5" fill="#000" />
      <rect x="10" y="23" width="4" height="3" fill="#e8defa" />
      <rect x="18" y="8" width="6" height="5" fill="#000" />
      <rect x="19" y="9" width="4" height="3" fill="#7c4dcc" />
    </Svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="16" cy="16" r="14" fill="#000" />
      <circle cx="16" cy="16" r="13" fill="#fff" />
      <circle cx="16" cy="16" r="12" fill="#0000c0" />
      <rect x="14" y="7" width="4" height="4" fill="#fff" />
      <rect x="14" y="13" width="4" height="11" fill="#fff" />
      <rect x="12" y="13" width="2" height="2" fill="#fff" />
      <rect x="12" y="23" width="8" height="2" fill="#fff" />
    </Svg>
  )
}

export function ShutdownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="24" height="19" fill="#000" />
      <rect x="3" y="4" width="22" height="17" fill="#c0c0c0" />
      <rect x="5" y="6" width="18" height="12" fill="#000" />
      <rect x="6" y="7" width="16" height="10" fill="#000080" />
      <rect x="9" y="22" width="10" height="3" fill="#000" />
      <rect x="5" y="25" width="18" height="3" fill="#000" />
      <circle cx="25" cy="23" r="6" fill="#000" />
      <circle cx="25" cy="23" r="5" fill="#e00000" />
      <rect x="24" y="19" width="2" height="5" fill="#fff" />
    </Svg>
  )
}

/** Small arrow badge drawn over shortcut icons. */
export function ShortcutOverlay() {
  return (
    <svg
      className="pixel"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ position: "absolute", left: 0, bottom: 0 }}
    >
      <rect width="12" height="12" fill="#000" />
      <rect x="1" y="1" width="10" height="10" fill="#fff" />
      <path d="M5 3h4v4H8V5H7v1H6v1H5v1H4v1H3V8h1V7h1V6h1V5H5z" fill="#000" />
    </svg>
  )
}

/** "Internet shortcut" page with a coloured brand badge. */
export function LinkFileIcon({
  size = 32,
  color,
  glyph,
  glyphColor = "#fff",
}: IconProps & { color: string; glyph: string; glyphColor?: string }) {
  return (
    <Svg size={size}>
      <path d="M5 1h15l7 7v23H5z" fill="#000" />
      <path d="M6 2h13v7h7v21H6z" fill="#fff" />
      <path d="M20 3l5 5h-5z" fill="#c0c0c0" />
      <rect x="9" y="5" width="8" height="1" fill="#c0c0c0" />
      <rect x="8" y="12" width="17" height="15" fill="#000" />
      <rect x="9" y="13" width="15" height="13" fill={color} />
      {glyph === "play" ? (
        <path d="M14 16h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1z" fill={glyphColor} />
      ) : (
        <text
          x="16.5"
          y="23.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="700"
          fontSize={glyph.length > 1 ? 8 : 11}
          fill={glyphColor}
          shapeRendering="auto"
        >
          {glyph}
        </text>
      )}
    </Svg>
  )
}

/** Four-pane logo on the Start button, in the site's purple palette. */
export function StartLogo() {
  return (
    <svg
      className="pixel"
      width="18"
      height="16"
      viewBox="0 0 18 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M2 2h6v5H1V3h1z" fill="#7c3aed" />
      <path d="M9 1h6v1h2v5H9z" fill="#ec4899" />
      <path d="M1 8h7v6H2v-1H1z" fill="#a78bfa" />
      <path d="M9 8h8v5h-1v1H9z" fill="#e8defa" />
    </svg>
  )
}

// ---------- Title bar glyphs ----------

export function MinimizeGlyph() {
  return (
    <svg width="8" height="7" viewBox="0 0 8 7" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="5" width="6" height="2" fill="currentColor" />
    </svg>
  )
}

export function MaximizeGlyph() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M0 0h9v9H0zM1 2v6h7V2z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function RestoreGlyph() {
  return (
    <svg width="8" height="9" viewBox="0 0 8 9" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 0h6v6H7V2H2z" fill="currentColor" />
      <path d="M0 3h6v6H0zM1 5v3h4V5z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function CloseGlyph() {
  return (
    <svg width="8" height="7" viewBox="0 0 8 7" shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SpeakerIcon() {
  return (
    <svg className="pixel" width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 5h3l4-4h1v14H9l-4-4H2z" fill="currentColor" />
      <path d="M3 6h2v4H3z" fill="#ffff00" />
      <path d="M6 6l3-3v10l-3-3z" fill="#808080" />
      <rect x="12" y="5" width="1" height="6" fill="currentColor" />
      <rect x="14" y="3" width="1" height="10" fill="currentColor" />
    </svg>
  )
}
