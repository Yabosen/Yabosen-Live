import { NextResponse } from 'next/server';

// "Static" variables (in-memory storage)
// Will persist as long as the serverless function container is warm.
let statusStore = {
  statusText: "Offline", // String 1
  additionalInfo: "",    // String 2
  timestamp: 0           // Long (number)
};

export async function GET() {
  return NextResponse.json(statusStore);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, statusText, additionalInfo, timestamp } = body;

    // Simple security check
    if (apiKey !== process.env.STATUS_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update variables
    // We only update if the specific field is provided, allowing partial updates if needed,
    // though the request implies setting them all is the standard way.
    if (statusText !== undefined) statusStore.statusText = String(statusText);
    if (additionalInfo !== undefined) statusStore.additionalInfo = String(additionalInfo);
    if (timestamp !== undefined) statusStore.timestamp = Number(timestamp);

    return NextResponse.json({ success: true, current: statusStore });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
