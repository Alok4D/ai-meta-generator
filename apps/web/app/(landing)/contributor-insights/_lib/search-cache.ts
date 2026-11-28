import {
    AdobeAssetItem,
    AiFilter,
    ContributorSummary,
    DateRangePreset,
    FileTypeFilter,
    SearchMode,
    SortOption
} from "../_components/types";

const DB_NAME = "nx-contributor-insights-db";
const DB_VERSION = 1;
const CACHE_STORE = "searchCache";
const RECENT_STORE = "recentSearches";
const MAX_RECENT_SEARCHES = 12;

export const DEFAULT_CACHE_TTL_HOURS = 6;

export interface CachedSearchEntry {
    cacheKey: string;
    items: AdobeAssetItem[];
    summary: ContributorSummary | null;
    cachedAt: number;
    ttlHours: number;
    expiresAt: number;
}

export interface RecentSearchEntry {
    id: string;
    query: string;
    normalizedQuery: string;
    displayLabel: string;
    mode: SearchMode;
    sortBy: SortOption;
    fileType: FileTypeFilter;
    aiContent: AiFilter;
    dateRange: DateRangePreset;
    startDate: string;
    endDate: string;
    lastSearchedAt: number;
}

export function normalizeSearchQuery(rawQuery: string): string {
    const trimmed = rawQuery.trim();
    if (!trimmed) return "";

    if (/^\d{5,20}$/.test(trimmed)) {
        return trimmed;
    }

    const contribMatch = trimmed.match(/contributor\/(\d+)/i);
    if (contribMatch?.[1]) return contribMatch[1];

    const assetMatch = trimmed.match(/\/(\d{6,20})(?:[/?#]|$)/);
    if (assetMatch?.[1]) return assetMatch[1];

    const anyDigits = trimmed.match(/\b\d{6,20}\b/);
    if (anyDigits?.[0]) return anyDigits[0];

    return trimmed.toLowerCase();
}

export function buildSearchCacheKey(params: {
    mode: SearchMode;
    query: string;
    sortBy: SortOption;
    fileType: FileTypeFilter;
    aiContent: AiFilter;
    dateRange: DateRangePreset;
    startDate: string;
    endDate: string;
    page: number;
}): string {
    const normalized = normalizeSearchQuery(params.query);
    const effectiveDateRange = params.mode === "contributor" ? params.dateRange : "all";
    const start = effectiveDateRange === "custom" ? params.startDate : "";
    const end = effectiveDateRange === "custom" ? params.endDate : "";
    return [
        params.mode,
        normalized,
        params.sortBy,
        params.fileType,
        params.aiContent,
        effectiveDateRange,
        start,
        end,
        `p${params.page}`
    ].join("::");
}

function openDb(): Promise<IDBDatabase | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        try {
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(CACHE_STORE)) {
                    db.createObjectStore(CACHE_STORE, { keyPath: "cacheKey" });
                }
                if (!db.objectStoreNames.contains(RECENT_STORE)) {
                    db.createObjectStore(RECENT_STORE, { keyPath: "id" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        } catch {
            resolve(null);
        }
    });
}

export async function getCachedSearch(cacheKey: string): Promise<CachedSearchEntry | null> {
    const db = await openDb();
    if (!db) return null;

    return new Promise((resolve) => {
        try {
            const tx = db.transaction(CACHE_STORE, "readwrite");
            const store = tx.objectStore(CACHE_STORE);
            const req = store.get(cacheKey);

            req.onsuccess = () => {
                const entry = req.result as CachedSearchEntry | undefined;
                if (!entry) {
                    resolve(null);
                    return;
                }
                if (Date.now() > entry.expiresAt) {
                    store.delete(cacheKey);
                    resolve(null);
                    return;
                }
                resolve(entry);
            };
            req.onerror = () => resolve(null);
            tx.oncomplete = () => db.close();
        } catch {
            db.close();
            resolve(null);
        }
    });
}

export async function setCachedSearch(params: {
    cacheKey: string;
    items: AdobeAssetItem[];
    summary: ContributorSummary | null;
    ttlHours: number;
}): Promise<void> {
    const db = await openDb();
    if (!db) return;

    const now = Date.now();
    const safeTtl = Number.isFinite(params.ttlHours) && params.ttlHours > 0
        ? params.ttlHours
        : DEFAULT_CACHE_TTL_HOURS;

    const entry: CachedSearchEntry = {
        cacheKey: params.cacheKey,
        items: params.items,
        summary: params.summary,
        cachedAt: now,
        ttlHours: safeTtl,
        expiresAt: now + safeTtl * 3600 * 1000
    };

    return new Promise((resolve) => {
        try {
            const tx = db.transaction(CACHE_STORE, "readwrite");
            tx.objectStore(CACHE_STORE).put(entry);
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => {
                db.close();
                resolve();
            };
        } catch {
            db.close();
            resolve();
        }
    });
}

export async function purgeExpiredCache(): Promise<void> {
    const db = await openDb();
    if (!db) return;

    return new Promise((resolve) => {
        try {
            const now = Date.now();
            const tx = db.transaction(CACHE_STORE, "readwrite");
            const store = tx.objectStore(CACHE_STORE);
            const req = store.openCursor();

            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return;
                const val = cursor.value as CachedSearchEntry;
                if (!val || now > val.expiresAt) {
                    cursor.delete();
                }
                cursor.continue();
            };

            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => {
                db.close();
                resolve();
            };
        } catch {
            db.close();
            resolve();
        }
    });
}

export async function getRecentSearches(limit = MAX_RECENT_SEARCHES): Promise<RecentSearchEntry[]> {
    const db = await openDb();
    if (!db) return [];

    return new Promise((resolve) => {
        try {
            const tx = db.transaction(RECENT_STORE, "readonly");
            const req = tx.objectStore(RECENT_STORE).getAll();

            req.onsuccess = () => {
                const all = (req.result as RecentSearchEntry[]) || [];
                all.sort((a, b) => b.lastSearchedAt - a.lastSearchedAt);
                resolve(all.slice(0, limit));
            };
            req.onerror = () => resolve([]);
            tx.oncomplete = () => db.close();
        } catch {
            db.close();
            resolve([]);
        }
    });
}

export async function upsertRecentSearch(params: {
    query: string;
    displayLabel?: string;
    mode: SearchMode;
    sortBy: SortOption;
    fileType: FileTypeFilter;
    aiContent: AiFilter;
    dateRange: DateRangePreset;
    startDate: string;
    endDate: string;
}): Promise<RecentSearchEntry[]> {
    const db = await openDb();
    if (!db) return [];

    const normalizedQuery = normalizeSearchQuery(params.query);
    if (!normalizedQuery) return getRecentSearches();

    const id = `${params.mode}::${normalizedQuery}`;
    const entry: RecentSearchEntry = {
        id,
        query: params.query.trim(),
        normalizedQuery,
        displayLabel: params.displayLabel?.trim() || normalizedQuery,
        mode: params.mode,
        sortBy: params.sortBy,
        fileType: params.fileType,
        aiContent: params.aiContent,
        dateRange: params.mode === "contributor" ? params.dateRange : "all",
        startDate: params.startDate,
        endDate: params.endDate,
        lastSearchedAt: Date.now()
    };

    await new Promise<void>((resolve) => {
        try {
            const tx = db.transaction(RECENT_STORE, "readwrite");
            const store = tx.objectStore(RECENT_STORE);
            store.put(entry);

            const allReq = store.getAll();
            allReq.onsuccess = () => {
                const all = (allReq.result as RecentSearchEntry[]) || [];
                if (all.length > MAX_RECENT_SEARCHES) {
                    all.sort((a, b) => b.lastSearchedAt - a.lastSearchedAt);
                    for (const stale of all.slice(MAX_RECENT_SEARCHES)) {
                        store.delete(stale.id);
                    }
                }
            };

            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => {
                db.close();
                resolve();
            };
        } catch {
            db.close();
            resolve();
        }
    });

    return getRecentSearches();
}

export async function removeRecentSearch(id: string): Promise<RecentSearchEntry[]> {
    const db = await openDb();
    if (!db) return [];

    await new Promise<void>((resolve) => {
        try {
            const tx = db.transaction(RECENT_STORE, "readwrite");
            tx.objectStore(RECENT_STORE).delete(id);
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => {
                db.close();
                resolve();
            };
        } catch {
            db.close();
            resolve();
        }
    });

    return getRecentSearches();
}

export async function clearRecentSearches(): Promise<void> {
    const db = await openDb();
    if (!db) return;

    return new Promise((resolve) => {
        try {
            const tx = db.transaction(RECENT_STORE, "readwrite");
            tx.objectStore(RECENT_STORE).clear();
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => {
                db.close();
                resolve();
            };
        } catch {
            db.close();
            resolve();
        }
    });
}
