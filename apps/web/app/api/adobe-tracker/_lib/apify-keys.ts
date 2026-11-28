import crypto from 'crypto';

export interface EnvApifyKey {
    index: number;
    token: string;
}

const SYSTEM_TOKEN_PAYLOAD = 'nx-apify-system-unlocked';

/**
 * Generates an HMAC-SHA256 access token derived from `APIFY_SYSTEM_MAGIC_WORD`.
 * Changing the env magic word automatically invalidates previously issued tokens.
 */
export function createSystemAccessToken(): string | null {
    const secret = process.env.APIFY_SYSTEM_MAGIC_WORD?.trim();
    if (!secret) return null;
    return crypto.createHmac('sha256', secret).update(SYSTEM_TOKEN_PAYLOAD).digest('hex');
}

/**
 * Verifies a client-supplied system access token against `APIFY_SYSTEM_MAGIC_WORD`.
 */
export function verifySystemAccessToken(token?: string | null): boolean {
    const expected = createSystemAccessToken();
    if (!expected || !token || typeof token !== 'string') return false;
    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(token.trim(), 'utf8');
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Reads numbered Apify API keys from environment variables (`APIFY_API_KEY_1`,
 * `APIFY_API_KEY_2`, ...), sorted numerically. Falls back to `APIFY_API_KEY`
 * (index 0) if present and not duplicated.
 */
export function getEnvApifyKeys(): EnvApifyKey[] {
    const numbered: EnvApifyKey[] = [];
    const seenTokens = new Set<string>();

    for (const [envName, rawValue] of Object.entries(process.env)) {
        const match = /^APIFY_API_KEY_(\d+)$/.exec(envName);
        if (!match) continue;
        const token = rawValue?.trim();
        if (!token || seenTokens.has(token)) continue;
        seenTokens.add(token);
        numbered.push({ index: Number(match[1]), token });
    }

    numbered.sort((a, b) => a.index - b.index);

    const legacyToken = process.env.APIFY_API_KEY?.trim();
    if (legacyToken && !seenTokens.has(legacyToken)) {
        numbered.unshift({ index: 0, token: legacyToken });
    }

    return numbered;
}

/**
 * Returns true when an Apify HTTP error indicates the API key itself is
 * invalid, expired, rate-limited, or out of credits.
 */
export function isApifyKeyFailure(status: number, message: string): boolean {
    if (status === 401 || status === 402 || status === 403 || status === 429) {
        return true;
    }
    const lower = message.toLowerCase();
    return (
        lower.includes('credit') ||
        lower.includes('limit') ||
        lower.includes('quota') ||
        lower.includes('exceeded') ||
        lower.includes('invalid') ||
        lower.includes('expired') ||
        lower.includes('unauthorized')
    );
}
