// Status API route for yabosen.live
// Uses file-based persistent storage
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
  const dataDir = path.dirname(STATUS_FILE)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Read status from file
async function readStatus(): Promise<StatusData> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(STATUS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist or is invalid, return default
    const defaultStatus: StatusData = {
      status: 'offline',
      customMessage: null,
      updatedAt: Date.now(),
    }
    // Try to write default status
    try {
      await writeStatus(defaultStatus)
    } catch (writeError) {
      console.error('Failed to write default status:', writeError)
    }
    return defaultStatus
  }
}

// Write status to file
async function writeStatus(data: StatusData): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(STATUS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export const dynamic = 'force-dynamic'

// GET - Public: Fetch current status
export async function GET() {
  try {
    const statusData = await readStatus()
    return NextResponse.json(statusData)
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

    // Update the status data
    const newStatusData: StatusData = {
      status: status as StatusType,
      customMessage: customMessage || null,
      updatedAt: Date.now(),
    }

    // Write to file for persistence
    await writeStatus(newStatusData)

    console.log('Status Updated Successfully:', newStatusData)

    return NextResponse.json({ success: true, ...newStatusData })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
