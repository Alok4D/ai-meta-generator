import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const token = body.token?.trim() || process.env.APIFY_API_KEY;

        if (!token) {
            return NextResponse.json({ valid: false, error: 'Apify API token is required' }, { status: 400 });
        }

        const res = await fetch('https://api.apify.com/v2/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({
                valid: false,
                error: data.error?.message || 'Invalid Apify API token'
            }, { status: 401 });
        }

        const user = data.data;
        return NextResponse.json({
            valid: true,
            username: user.username,
            plan: user.plan?.id || user.plan?.tier || 'FREE',
            monthlyCredits: user.plan?.monthlyUsageCreditsUsd || 5,
            email: user.email ? `${user.email.slice(0, 3)}***@${user.email.split('@')[1] || ''}` : undefined,
            maskedToken: `${token.slice(0, 10)}...${token.slice(-4)}`
        });
    } catch (error: any) {
        return NextResponse.json({
            valid: false,
            error: error.message || 'Failed to verify Apify token'
        }, { status: 500 });
    }
}
