// Status API route for yabosen.live
// Uses filesystem storage for persistence
// Add to: app/api/status/route.ts

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Status types
export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'

interface StatusData {
  status: StatusType
  customMessage: string | null
  updatedAt: number
}

const STATUS_FILE = path.join(process.cwd(), 'data', 'status.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.dirname(STATUS_FILE), { recursive: true })
  } catch (error) {
    // Directory already exists or can't be created
  }
}

// Read status from file
async function readStatus(): Promise<StatusData> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(STATUS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist or is invalid, return default
    const defaultStatus: StatusData = {
      status: 'online',
      customMessage: null,
      updatedAt: Date.now(),
    }
    // Try to save default
    try {
      await fs.writeFile(STATUS_FILE, JSON.stringify(defaultStatus, null, 2))
    } catch (writeError) {
      // Ignore write errors
    }
    return defaultStatus
  }
}

// Write status to file
async function writeStatus(data: StatusData): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(STATUS_FILE, JSON.stringify(data, null, 2))
}

export const dynamic = 'force-dynamic'

// GET - Public: Fetch current status
export async function GET() {
  try {
    const status = await readStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to fetch status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}

// POST - Protected: Update status (requires API key)
export async function POST(request: Request) {
  try {
    // Verify Password
    const authHeader = request.headers.get('Authorization')
    const password = authHeader?.replace('Bearer ', '')

    console.log('Status Update Attempt:', { hasAuth: !!password, hasEnvPass: !!process.env.ADMIN_PASSWORD })

    // Check against ADMIN_PASSWORD from env
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      console.log('Status Update Failed: Invalid Password')
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Password' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Status Update Body:', body)

    // Normalize input
    let { status, customMessage, message } = body

    // Handle aliases and case-insensitivity
    if (typeof status === 'string') status = status.toLowerCase()
    if (!customMessage && message) customMessage = message

    // Validate status
    const validStatuses: StatusType[] = ['online', 'offline', 'dnd', 'idle', 'sleeping', 'streaming']
    if (!validStatuses.includes(status)) {
      console.log(`Status Update Failed: Invalid status '${status}'`)
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Update and persist status
    const newStatus: StatusData = {
      status: status as StatusType,
      customMessage: customMessage || null,
      updatedAt: Date.now(),
    }

    await writeStatus(newStatus)

    console.log('Status Updated Successfully:', newStatus)

    return NextResponse.json({ success: true, ...newStatus })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
