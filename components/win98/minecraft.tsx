"use client"

import { useEffect, useState, type CSSProperties } from "react"
import type { MinecraftData } from "@/app/api/minecraft/route"
import { ButtonRow, LinkButton, usePolledJson } from "./apps"

const REFRESH_MS = 10 * 60_000
const SCALE = 7 // screen pixels per skin pixel

type Tab = "profile" | "friends"
type View = "front" | "back"

/** One rectangle copied from the skin texture: source x/y, size, and where it goes on the figure. */
interface Piece {
  src: [number, number]
  size: [number, number]
  at: [number, number]
  mirror?: boolean
}

/**
 * Faces of a Minecraft skin (64×64, or legacy 64×32 where the left limbs mirror the right)
 * laid out as a flat 16×32 figure seen from the front or back.
 */
function skinPieces(view: View, slim: boolean, legacy: boolean): { base: Piece[]; overlay: Piece[] } {
  const aw = slim ? 3 : 4 // arm width
  const front = view === "front"
  // The player's right side is on the viewer's left when facing them.
  const nearX = 4 - aw
  const [rightArmX, leftArmX] = front ? [nearX, 12] : [12, nearX]
  const [rightLegX, leftLegX] = front ? [4, 8] : [8, 4]

  const rightArm: [number, number] = front ? [44, 20] : [slim ? 51 : 52, 20]
  const rightLeg: [number, number] = front ? [4, 20] : [12, 20]
  const base: Piece[] = [
    { src: front ? [8, 8] : [24, 8], size: [8, 8], at: [4, 0] },
    { src: front ? [20, 20] : [32, 20], size: [8, 12], at: [4, 8] },
    { src: rightArm, size: [aw, 12], at: [rightArmX, 8] },
    { src: rightLeg, size: [4, 12], at: [rightLegX, 20] },
    legacy
      ? { src: rightArm, size: [aw, 12], at: [leftArmX, 8], mirror: true }
      : { src: front ? [36, 52] : [slim ? 43 : 44, 52], size: [aw, 12], at: [leftArmX, 8] },
    legacy
      ? { src: rightLeg, size: [4, 12], at: [leftLegX, 20], mirror: true }
      : { src: front ? [20, 52] : [28, 52], size: [4, 12], at: [leftLegX, 20] },
  ]
  // Legacy skins only have the hat layer.
  const overlay: Piece[] = legacy
    ? [{ src: front ? [40, 8] : [56, 8], size: [8, 8], at: [4, 0] }]
    : [
        { src: front ? [40, 8] : [56, 8], size: [8, 8], at: [4, 0] },
        { src: front ? [20, 36] : [32, 36], size: [8, 12], at: [4, 8] },
        { src: front ? [44, 36] : [slim ? 51 : 52, 36], size: [aw, 12], at: [rightArmX, 8] },
        { src: front ? [52, 52] : [slim ? 59 : 60, 52], size: [aw, 12], at: [leftArmX, 8] },
        { src: front ? [4, 36] : [12, 36], size: [4, 12], at: [rightLegX, 20] },
        { src: front ? [4, 52] : [12, 52], size: [4, 12], at: [leftLegX, 20] },
      ]
  return { base, overlay }
}

function pieceStyle(url: string, sheet: [number, number], p: Piece, scale: number): CSSProperties {
  return {
    position: "absolute",
    left: p.at[0] * scale,
    top: p.at[1] * scale,
    width: p.size[0] * scale,
    height: p.size[1] * scale,
    backgroundImage: `url(${url})`,
    backgroundSize: `${sheet[0] * scale}px ${sheet[1] * scale}px`,
    backgroundPosition: `${-p.src[0] * scale}px ${-p.src[1] * scale}px`,
    imageRendering: "pixelated",
    transform: p.mirror ? "scaleX(-1)" : undefined,
  }
}

function SkinFigure({ skin, slim, cape, view }: { skin: string; slim: boolean; cape: string | null; view: View }) {
  // Old-style 64×32 skins need their left limbs mirrored from the right ones.
  const [legacy, setLegacy] = useState(false)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setLegacy(img.naturalHeight === 32)
    img.src = skin
  }, [skin])

  const { base, overlay } = skinPieces(view, slim, legacy)
  const sheet: [number, number] = [64, legacy ? 32 : 64]
  return (
    <div
      role="img"
      aria-label={`Minecraft skin, ${view} view`}
      style={{ position: "relative", width: 16 * SCALE, height: 32 * SCALE }}
    >
      {base.map((p, i) => (
        <span key={`b${i}`} style={pieceStyle(skin, sheet, p, SCALE)} />
      ))}
      {overlay.map((p, i) => (
        <span key={`o${i}`} style={pieceStyle(skin, sheet, p, SCALE)} />
      ))}
      {/* Seen from behind, the cape hangs over the back. */}
      {view === "back" && cape && (
        <span style={pieceStyle(cape, [64, 32], { src: [1, 1], size: [10, 16], at: [3, 8] }, SCALE)} />
      )}
    </div>
  )
}

export function MinecraftApp() {
  const { data, loading, failed } = usePolledJson<MinecraftData>("/api/minecraft", REFRESH_MS)
  const [tab, setTab] = useState<Tab>("profile")

  return (
    <div>
      <div className="w98-tabs" role="tablist">
        {(["profile", "friends"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`w98-tab${tab === t ? " is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "profile" ? "Profile" : `Friends${data ? ` (${data.friends.length})` : ""}`}
          </button>
        ))}
      </div>
      <div className="w98-tabpanel" role="tabpanel">
        {loading && <span>Connecting to Mojang...</span>}
        {failed && <span>Couldn&apos;t reach Mojang right now.</span>}
        {data && tab === "profile" && <Profile data={data} />}
        {data && tab === "friends" && <Friends data={data} />}
      </div>

      <ButtonRow>
        {data?.skin && <LinkButton href={data.skin.url}>Download skin</LinkButton>}
        <LinkButton href={data?.namemcUrl ?? "https://namemc.com/profile/Yab0sen"}>NameMC profile</LinkButton>
      </ButtonRow>
      <div className="w98-statusbar" style={{ marginTop: 8 }}>
        <span className="grow">namemc.com/profile/Yab0sen</span>
        <span>{data?.errors.length ? "Partly unavailable" : data ? "Up to date" : "..."}</span>
      </div>
    </div>
  )
}

function Profile({ data }: { data: MinecraftData }) {
  const [view, setView] = useState<View>("front")
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div className="w98-sunken w98-skin-stage">
          {data.skin ? (
            <SkinFigure skin={data.skin.url} slim={data.skin.slim} cape={data.cape} view={view} />
          ) : (
            <span style={{ color: "var(--w98-muted)" }}>No skin</span>
          )}
        </div>
        {data.skin && (
          <button type="button" className="w98-btn" onClick={() => setView((v) => (v === "front" ? "back" : "front"))}>
            Turn around
          </button>
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{data.name}</div>
        <div style={{ color: "var(--w98-muted)", marginTop: 2 }}>Minecraft: Java Edition</div>

        <fieldset className="w98-group">
          <legend>Account</legend>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "1px 8px 1px 0", verticalAlign: "top" }}>UUID:</td>
                <td style={{ padding: "1px 0", wordBreak: "break-all", userSelect: "all" }}>{data.uuid ?? "—"}</td>
              </tr>
              <tr>
                <td style={{ padding: "1px 8px 1px 0" }}>Model:</td>
                <td>{data.skin ? (data.skin.slim ? "Slim (Alex)" : "Classic (Steve)") : "—"}</td>
              </tr>
              <tr>
                <td style={{ padding: "1px 8px 1px 0" }}>Friends:</td>
                <td>{data.friends.length} on NameMC</td>
              </tr>
            </tbody>
          </table>
        </fieldset>

        {data.cape && (
          <fieldset className="w98-group">
            <legend>Cape</legend>
            <div className="w98-sunken w98-skin-stage" style={{ display: "inline-block", padding: 6 }}>
              <div style={{ position: "relative", width: 10 * 4, height: 16 * 4 }}>
                <span style={pieceStyle(data.cape, [64, 32], { src: [1, 1], size: [10, 16], at: [0, 0] }, 4)} />
              </div>
            </div>
          </fieldset>
        )}
      </div>
    </div>
  )
}

function Friends({ data }: { data: MinecraftData }) {
  if (!data.friends.length) return <span style={{ color: "var(--w98-muted)" }}>No NameMC friends yet.</span>
  return (
    <div className="w98-listview">
      {data.friends.map((f) => (
        <a
          key={f.uuid}
          className="w98-repo"
          href={`https://namemc.com/profile/${f.uuid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${f.uuid}/32`}
            alt=""
            width={16}
            height={16}
            loading="lazy"
            style={{ imageRendering: "pixelated", flexShrink: 0 }}
          />
          <b className="w98-repo-name">{f.name}</b>
        </a>
      ))}
    </div>
  )
}
