import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch(`https://open.faceit.com/data/v4/players?nickname=Yabosen&game=cs2`, {
            headers: {
                'Authorization': 'Bearer 3edc39a3-457a-4fea-a54e-b4a088680b2c'
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch Faceit data' }, { status: res.status });
        }

        const data = await res.json();

        // Extract only what we need
        const stats = {
            nickname: data.nickname,
            elo: data.games.cs2.faceit_elo,
            level: data.games.cs2.skill_level,
            avatar: data.avatar
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Faceit API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
