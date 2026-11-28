import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const magicWord = typeof body.magicWord === 'string' ? body.magicWord.trim() : '';

        const res = await fetch(`${API_BASE}/api/system-settings/apify-magic-word/unlock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ magicWord }),
            cache: 'no-store'
        });

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        return NextResponse.json({
            unlocked: false,
            error: error.message || 'Failed to verify magic word.'
        }, { status: 500 });
    }
}
