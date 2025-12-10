<<<<<<< HEAD
import { NextResponse } from 'next/server';

// "Static" variables (in-memory storage)
// Matches the "two strings, one long" description and original variable names
let statusCache = {
    status: "offline",       // String 1
    customMessage: "",       // String 2
    updatedAt: 0             // Long (number)
};

export async function GET() {
    return NextResponse.json(statusCache);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { apiKey, status, customMessage, updatedAt } = body;

        // Simple security check (restoring usage of STATUS_API_KEY)
        if (apiKey !== process.env.STATUS_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update variables
        if (status !== undefined) statusCache.status = String(status);
        if (customMessage !== undefined) statusCache.customMessage = String(customMessage);
        if (updatedAt !== undefined) statusCache.updatedAt = Number(updatedAt);

        return NextResponse.json({ success: true, ...statusCache });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
=======
// Status API route for yabosen.live
// Add to: app/api/status/route.ts

import { NextResponse } from 'next/server'

// Status types
export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'

interface StatusData {
  status: StatusType
  customMessage?: string
  updatedAt: number
}

// In-memory storage for status
// In production with multiple serverless instances, status may be inconsistent
// Consider using a database for persistence across instances
let statusCache: StatusData | null = null

// GET - Public: Fetch current status
export async function GET() {
  try {
    if (!statusCache) {
      // Return default offline status if none set
      return NextResponse.json({
        status: 'offline',
        customMessage: null,
        updatedAt: Date.now(),
      })
    }

    return NextResponse.json(statusCache)
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
    // Verify API key
    const authHeader = request.headers.get('Authorization')
    const apiKey = authHeader?.replace('Bearer ', '')
    
    if (!apiKey || apiKey !== process.env.STATUS_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { status, customMessage } = body
    
    // Validate status
    const validStatuses: StatusType[] = ['online', 'offline', 'dnd', 'idle', 'sleeping', 'streaming']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }
    
    const statusData: StatusData = {
      status,
      customMessage: customMessage || null,
      updatedAt: Date.now(),
    }

    // Store in memory
    statusCache = statusData

    return NextResponse.json({ success: true, ...statusData })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
>>>>>>> parent of 9e59bb0 (f[jaseuifhe;FIUEDGHBVDEGehgoiuerjS:HBGdefrgiulerlz.cfkbgivefrdlgv)
}
