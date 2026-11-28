const FAILED_KEYS_STORAGE = "nx-apify-failed-keys";
const FAILED_CUSTOM_KEYS_STORAGE = "nx-apify-failed-custom-keys";
const SYSTEM_ACCESS_TOKEN_STORAGE = "nx-apify-system-token";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

interface FailedStoragePayload<T> {
    items: T[];
    expiresAt: number;
}

function readExpiringList<T>(storageKey: string, guard: (val: unknown) => val is T): T[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Partial<FailedStoragePayload<T>> & { failedIndices?: unknown[] };
        const list = Array.isArray(parsed?.items)
            ? parsed.items
            : Array.isArray(parsed?.failedIndices)
                ? parsed.failedIndices
                : null;
        if (!list || typeof parsed?.expiresAt !== "number" || Date.now() >= parsed.expiresAt) {
            localStorage.removeItem(storageKey);
            return [];
        }
        return list.filter(guard);
    } catch {
        localStorage.removeItem(storageKey);
        return [];
    }
}

function appendExpiringList<T>(
    storageKey: string,
    newItems: T[],
    guard: (val: unknown) => val is T
): T[] {
    if (typeof window === "undefined" || newItems.length === 0) {
        return readExpiringList(storageKey, guard);
    }
    const existing = readExpiringList(storageKey, guard);
    let expiresAt = Date.now() + ONE_MONTH_MS;

    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
            const parsed = JSON.parse(raw) as { expiresAt?: number };
            if (typeof parsed?.expiresAt === "number" && Date.now() < parsed.expiresAt) {
                expiresAt = parsed.expiresAt;
            }
        }
    } catch {
        // Use fresh expiresAt
    }

    const merged = Array.from(new Set([...existing, ...newItems]));
    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({ items: merged, expiresAt } satisfies FailedStoragePayload<T>)
        );
    } catch {
        // Ignore storage quota errors
    }
    return merged;
}

const isNumber = (v: unknown): v is number => typeof v === "number";
const isString = (v: unknown): v is string => typeof v === "string" && v.length > 0;

export const getFailedKeyIndices = (): number[] =>
    readExpiringList(FAILED_KEYS_STORAGE, isNumber);

export const recordFailedKeyIndices = (newIndices: number[]): number[] =>
    appendExpiringList(FAILED_KEYS_STORAGE, newIndices, isNumber);

export const clearFailedKeyIndices = (): void => {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(FAILED_KEYS_STORAGE); } catch {}
};

export const getFailedCustomKeyIds = (): string[] =>
    readExpiringList(FAILED_CUSTOM_KEYS_STORAGE, isString);

export const recordFailedCustomKeyIds = (newIds: string[]): string[] =>
    appendExpiringList(FAILED_CUSTOM_KEYS_STORAGE, newIds, isString);

export const removeFailedCustomKeyId = (id: string): string[] => {
    const remaining = getFailedCustomKeyIds().filter((item) => item !== id);
    if (typeof window === "undefined") return remaining;
    try {
        if (remaining.length === 0) {
            localStorage.removeItem(FAILED_CUSTOM_KEYS_STORAGE);
        } else {
            const raw = localStorage.getItem(FAILED_CUSTOM_KEYS_STORAGE);
            const parsed = raw ? (JSON.parse(raw) as { expiresAt?: number }) : null;
            const expiresAt = typeof parsed?.expiresAt === "number" ? parsed.expiresAt : Date.now() + ONE_MONTH_MS;
            localStorage.setItem(FAILED_CUSTOM_KEYS_STORAGE, JSON.stringify({ items: remaining, expiresAt }));
        }
    } catch {}
    return remaining;
};

export const clearFailedCustomKeyIds = (): void => {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(FAILED_CUSTOM_KEYS_STORAGE); } catch {}
};

export const getSystemAccessToken = (): string | null => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(SYSTEM_ACCESS_TOKEN_STORAGE); } catch { return null; }
};

export const setSystemAccessToken = (token: string): void => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(SYSTEM_ACCESS_TOKEN_STORAGE, token); } catch {}
};

export const clearSystemAccessToken = (): void => {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(SYSTEM_ACCESS_TOKEN_STORAGE); } catch {}
};
