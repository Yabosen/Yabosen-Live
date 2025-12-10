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
}
