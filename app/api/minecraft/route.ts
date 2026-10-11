import { NextResponse } from 'next/server'

// Minecraft profile for the homepage's Minecraft window: account + skin/cape from
// Mojang, friends from NameMC's public API (namemc.com itself blocks servers).
const USERNAME = 'Yab0sen'
const REVALIDATE = 600 // seconds

export interface MinecraftFriend {
  uuid: string
  name: string
}

export interface MinecraftData {
  name: string
  uuid: string | null // dashed
  skin: { url: string; slim: boolean } | null
  cape: string | null
  friends: MinecraftFriend[]
  namemcUrl: string
  errors: string[]
}

function dashed(id: string) {
  return id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5')
}

async function json<T>(url: string, revalidate = REVALIDATE): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': 'yabosen.live' }, next: { revalidate } })
  if (!res.ok) throw new Error(`${new URL(url).hostname} returned ${res.status}`)
  return res.json()
}

export async function GET() {
  const errors: string[] = []
  const body: MinecraftData = {
    name: USERNAME,
    uuid: null,
    skin: null,
    cape: null,
    friends: [],
    namemcUrl: `https://namemc.com/profile/${USERNAME}`,
    errors,
  }

  try {
    // Name → UUID changes only if the name does, so cache it longer.
    const account = await json<{ id: string; name: string }>(
      `https://api.mojang.com/users/profiles/minecraft/${USERNAME}`,
      3600,
    )
    body.name = account.name
    body.uuid = dashed(account.id)
    // A UUID link always lands on the right profile; a name can be ambiguous on NameMC.
    body.namemcUrl = `https://namemc.com/profile/${body.uuid}`

    const [profile, friends] = await Promise.all([
      json<{ properties: { name: string; value: string }[] }>(
        `https://sessionserver.mojang.com/session/minecraft/profile/${account.id}`,
      ).catch((err: Error) => {
        errors.push(err.message)
        return null
      }),
      json<MinecraftFriend[]>(`https://api.namemc.com/profile/${body.uuid}/friends`, 3600).catch((err: Error) => {
        errors.push(err.message)
        return [] as MinecraftFriend[]
      }),
    ])

    const encoded = profile?.properties.find((p) => p.name === 'textures')?.value
    if (encoded) {
      const textures = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')).textures ?? {}
      const https = (url?: string) => url?.replace(/^http:/, 'https:') ?? null
      if (textures.SKIN?.url) {
        body.skin = { url: https(textures.SKIN.url)!, slim: textures.SKIN.metadata?.model === 'slim' }
      }
      body.cape = https(textures.CAPE?.url)
    }
    body.friends = friends
      .filter((f) => f?.uuid && f?.name)
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err))
  }

  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=3600` },
  })
}
