"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Sparkles, Layers, AlertCircle, FileSearch, RefreshCw, Download, ChevronLeft, ChevronRight } from "lucide-react";

import { AdobeAssetItem, ContributorSummary, ApifyKeyRecord, SearchMode, FileTypeFilter, AiFilter, SortOption, DateRangePreset } from "./_components/types";
import SearchControls from "./_components/SearchControls";
import ContributorCard from "./_components/ContributorCard";
import DateRangeBanner from "./_components/DateRangeBanner";
import ResultsSkeleton from "./_components/ResultsSkeleton";
import AssetCard from "./_components/AssetCard";
import AssetDetailsModal from "./_components/AssetDetailsModal";
import ApiSettingsModal from "./_components/ApiSettingsModal";
import RecentSearches from "./_components/RecentSearches";
import {
    buildSearchCacheKey,
    clearRecentSearches,
    DEFAULT_CACHE_TTL_HOURS,
    getCachedSearch,
    getRecentSearches,
    purgeExpiredCache,
    RecentSearchEntry,
    removeRecentSearch,
    setCachedSearch,
    upsertRecentSearch
} from "./_lib/search-cache";
import {
    getFailedKeyIndices,
    recordFailedKeyIndices,
    clearFailedKeyIndices,
    getFailedCustomKeyIds,
    recordFailedCustomKeyIds,
    removeFailedCustomKeyId,
    clearFailedCustomKeyIds,
    getSystemAccessToken,
    setSystemAccessToken,
    clearSystemAccessToken
} from "./_lib/apify-fallback";

const STORAGE_KEY = "nx-apify-keys";
const SELECTED_KEY_STORAGE = "nx-apify-selected-key";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Default key entry (token will be supplied by server env if left empty)
const DEFAULT_INITIAL_KEY: ApifyKeyRecord = {
    id: "default-apify-key",
    token: "",
    label: "Apify Account",
    username: "neighborly_oatcake",
    plan: "FREE",
    health: "active"
};

export default function ContributorInsightsPage() {

    // Mode & Search states
    const [mode, setMode] = useState<SearchMode>("contributor");
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Filters
    const [fileType, setFileType] = useState<FileTypeFilter>("all");
    const [aiContent, setAiContent] = useState<AiFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("downloads");
    const [dateRange, setDateRange] = useState<DateRangePreset>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [soldOnly, setSoldOnly] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Data states
    const [items, setItems] = useState<AdobeAssetItem[]>([]);
    const [summary, setSummary] = useState<ContributorSummary | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<AdobeAssetItem | null>(null);
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);

    // Apify Keys state
    const [keys, setKeys] = useState<ApifyKeyRecord[]>([]);
    const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [failedKeysCount, setFailedKeysCount] = useState(0);
    const [failedCustomKeysCount, setFailedCustomKeysCount] = useState(0);
    const [systemAccessTokenState, setSystemAccessTokenState] = useState<string | null>(null);

    // Search Cache & Recent Searches state
    const [cacheTtlHours, setCacheTtlHours] = useState<number>(DEFAULT_CACHE_TTL_HOURS);
    const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>([]);

    // Load saved keys from localStorage on mount
    useEffect(() => {
        const storedSystemToken = getSystemAccessToken();
        setSystemAccessTokenState(storedSystemToken);
        setFailedKeysCount(getFailedKeyIndices().length);
        setFailedCustomKeysCount(getFailedCustomKeyIds().length);

        try {
            const savedKeysJson = localStorage.getItem(STORAGE_KEY);
            let loadedKeys: ApifyKeyRecord[] = [];
            if (savedKeysJson) {
                const parsed = JSON.parse(savedKeysJson);
                if (Array.isArray(parsed)) {
                    loadedKeys = parsed;
                }
            }

            if (storedSystemToken) {
                if (!loadedKeys.some(k => k.id === DEFAULT_INITIAL_KEY.id)) {
                    loadedKeys = [DEFAULT_INITIAL_KEY, ...loadedKeys];
                }
            } else {
                loadedKeys = loadedKeys.filter(k => k.id !== DEFAULT_INITIAL_KEY.id);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedKeys));
            setKeys(loadedKeys);

            const savedSelectedId = localStorage.getItem(SELECTED_KEY_STORAGE);
            if (savedSelectedId && loadedKeys.some(k => k.id === savedSelectedId)) {
                setSelectedKeyId(savedSelectedId);
            } else {
                const firstId = loadedKeys[0]?.id || null;
                setSelectedKeyId(firstId);
                if (firstId) localStorage.setItem(SELECTED_KEY_STORAGE, firstId);
                else localStorage.removeItem(SELECTED_KEY_STORAGE);
            }
        } catch (_) {
            setKeys([]);
            setSelectedKeyId(null);
        }
    }, []);

    // Load active cache TTL from backend, purge expired IndexedDB entries, and load recent searches
    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/system-settings/search-cache-ttl`, {
                    cache: "no-store"
                });
                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    const parsed = Number(data?.ttlHours);
                    if (active && Number.isFinite(parsed) && parsed > 0) {
                        setCacheTtlHours(parsed);
                    }
                }
            } catch {
                // Keep default 6h TTL if backend is unreachable
            }

            await purgeExpiredCache();
            const recent = await getRecentSearches();
            if (active) {
                setRecentSearches(recent);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const persistKeys = (updated: ApifyKeyRecord[], nextSelectedId?: string | null) => {
        setKeys(updated);
        if (nextSelectedId !== undefined) {
            setSelectedKeyId(nextSelectedId);
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            if (nextSelectedId !== undefined) {
                if (nextSelectedId) localStorage.setItem(SELECTED_KEY_STORAGE, nextSelectedId);
                else localStorage.removeItem(SELECTED_KEY_STORAGE);
            }
        } catch (_) {}
    };

    // Save keys updates
    const handleAddKeys = (newKeys: ApifyKeyRecord[]) => {
        if (newKeys.length === 0) return;
        const newIds = new Set(newKeys.map(k => k.id));
        const updated = [...keys.filter(k => !newIds.has(k.id)), ...newKeys];
        persistKeys(updated, newKeys[0]?.id ?? null);
    };

    const handleAddKey = (newKey: ApifyKeyRecord) => {
        handleAddKeys([newKey]);
    };

    const handleDeleteKey = (id: string) => {
        const updated = keys.filter(k => k.id !== id);
        const nextSelected = selectedKeyId === id
            ? (updated.length > 0 ? updated[0]?.id || null : null)
            : selectedKeyId;
        persistKeys(updated, nextSelected);
        if (id !== DEFAULT_INITIAL_KEY.id) {
            setFailedCustomKeysCount(removeFailedCustomKeyId(id).length);
        }
    };

    const handleSelectKey = (id: string) => {
        setSelectedKeyId(id);
        try {
            localStorage.setItem(SELECTED_KEY_STORAGE, id);
        } catch (_) {}
    };

    const handleUpdateKey = (updatedKey: ApifyKeyRecord) => {
        const updated = keys.map(k => k.id === updatedKey.id ? updatedKey : k);
        persistKeys(updated);
        if (updatedKey.health === 'active' && updatedKey.id !== DEFAULT_INITIAL_KEY.id) {
            setFailedCustomKeysCount(removeFailedCustomKeyId(updatedKey.id).length);
        }
    };

    const handleUnlockSystem = (accessToken: string) => {
        setSystemAccessToken(accessToken);
        setSystemAccessTokenState(accessToken);
        const updated = keys.some(k => k.id === DEFAULT_INITIAL_KEY.id)
            ? keys
            : [DEFAULT_INITIAL_KEY, ...keys];
        persistKeys(updated, DEFAULT_INITIAL_KEY.id);
    };

    const handleLockSystem = () => {
        clearSystemAccessToken();
        setSystemAccessTokenState(null);
        const updated = keys.filter(k => k.id !== DEFAULT_INITIAL_KEY.id);
        const nextSelected = selectedKeyId === DEFAULT_INITIAL_KEY.id
            ? (updated[0]?.id || null)
            : selectedKeyId;
        persistKeys(updated, nextSelected);
    };

    const selectedKey = keys.find(k => k.id === selectedKeyId) || null;

    const applySearchResults = (
        resultItems: AdobeAssetItem[],
        newSummary: ContributorSummary | null,
        activeMode: SearchMode,
        targetPage: number,
        activeDateRange: DateRangePreset,
        emptyMessage?: string
    ) => {
        setItems(resultItems);
        if (newSummary) {
            if (targetPage > 1) {
                setSummary(prev => {
                    if (!prev || activeMode !== 'contributor' || String(prev.creatorId) !== String(newSummary.creatorId)) {
                        return newSummary;
                    }
                    return {
                        ...newSummary,
                        totalAssets: newSummary.totalAssets || prev.totalAssets,
                        totalSampleDownloads: (newSummary.totalSampleDownloads > 0 ? newSummary.totalSampleDownloads : (prev.totalSampleDownloads ?? 0)),
                        typeDownloads: newSummary.typeDownloads || prev.typeDownloads
                    };
                });
            } else {
                setSummary(newSummary);
            }
        } else {
            setSummary(null);
        }

        if (resultItems.length === 0 && activeDateRange === 'all') {
            Swal.fire({
                icon: "info",
                title: "No Results",
                text: emptyMessage || "No matching assets found for this search.",
                confirmButtonColor: "#3b82f6"
            });
        }
    };

    // Search Execution
    const executeSearch = async (
        targetQuery = query,
        activeMode = mode,
        activeSort = sortBy,
        activeType = fileType,
        activeAi = aiContent,
        targetPage = 1,
        activeDateRange = dateRange,
        activeStart = startDate,
        activeEnd = endDate
    ) => {
        const trimmed = targetQuery.trim();
        if (!trimmed) {
            Swal.fire({
                icon: "info",
                title: "Search Query Required",
                text: activeMode === 'contributor' 
                    ? "Please enter an Adobe Contributor ID or profile link."
                    : "Please enter an Adobe Stock File ID or image link.",
                confirmButtonColor: "#3b82f6"
            });
            return;
        }

        const cacheKey = buildSearchCacheKey({
            mode: activeMode,
            query: trimmed,
            sortBy: activeSort,
            fileType: activeType,
            aiContent: activeAi,
            dateRange: activeDateRange,
            startDate: activeStart,
            endDate: activeEnd,
            page: targetPage
        });

        const cachedEntry = await getCachedSearch(cacheKey);
        if (cachedEntry) {
            setIsLoading(true);
            setSearched(true);
            setCurrentPage(targetPage);

            // Silent 1-2s artificial delay so cached loads feel identical to live fetches
            const delayMs = 1000 + Math.floor(Math.random() * 800);
            await new Promise((resolve) => setTimeout(resolve, delayMs));

            applySearchResults(
                cachedEntry.items || [],
                cachedEntry.summary || null,
                activeMode,
                targetPage,
                activeDateRange
            );

            const updatedRecent = await upsertRecentSearch({
                query: trimmed,
                displayLabel: activeMode === 'contributor' ? (cachedEntry.summary?.creatorName || trimmed) : trimmed,
                mode: activeMode,
                sortBy: activeSort,
                fileType: activeType,
                aiContent: activeAi,
                dateRange: activeDateRange,
                startDate: activeStart,
                endDate: activeEnd
            });
            setRecentSearches(updatedRecent);
            setIsLoading(false);
            return;
        }

        const isSystemKeySelected = Boolean(selectedKey && !selectedKey.token);
        const customKeysPool = keys.filter(k => k.token && k.token.trim().length > 0);

        if (!selectedKey || (isSystemKeySelected && !systemAccessTokenState)) {
            setIsSettingsOpen(true);
            Swal.fire({
                icon: "info",
                title: "Apify API Key Required",
                text: "Please add your own Apify API key(s) or unlock system keys with the magic word in API Settings.",
                confirmButtonColor: "#3b82f6"
            });
            return;
        }

        let orderedCustomKeys: { id: string; token: string }[] = [];
        if (!isSystemKeySelected) {
            const failedCustomIds = getFailedCustomKeyIds();
            const prioritized = [
                selectedKey,
                ...customKeysPool.filter(k => k.id !== selectedKey.id)
            ];
            orderedCustomKeys = prioritized
                .filter(k => k.token && k.token.trim().length > 0 && !failedCustomIds.includes(k.id))
                .map(k => ({ id: k.id, token: k.token.trim() }));

            if (orderedCustomKeys.length === 0) {
                setIsSettingsOpen(true);
                Swal.fire({
                    icon: "warning",
                    title: "All Saved Keys Failed",
                    text: "All your saved Apify API keys have failed or reached their limit. Please add a new key or reset failed keys in API Settings.",
                    confirmButtonColor: "#3b82f6"
                });
                return;
            }
        }

        setIsLoading(true);
        setSearched(true);
        setCurrentPage(targetPage);

        try {
            const failedKeyIndices = isSystemKeySelected ? getFailedKeyIndices() : [];
            const res = await fetch("/api/adobe-tracker/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: activeMode,
                    query: trimmed,
                    sortBy: activeSort,
                    fileType: activeType,
                    aiContent: activeAi,
                    dateRange: activeMode === 'contributor' ? activeDateRange : 'all',
                    startDate: activeStart,
                    endDate: activeEnd,
                    maxItems: 100,
                    page: targetPage,
                    customKeys: !isSystemKeySelected ? orderedCustomKeys : undefined,
                    failedKeyIndices,
                    systemAccessToken: isSystemKeySelected ? systemAccessTokenState : undefined
                })
            });

            const data = await res.json();

            if (isSystemKeySelected && Array.isArray(data.newlyFailedIndices) && data.newlyFailedIndices.length > 0) {
                const updatedFailed = recordFailedKeyIndices(data.newlyFailedIndices);
                setFailedKeysCount(updatedFailed.length);
            }

            if (!isSystemKeySelected && Array.isArray(data.newlyFailedCustomKeyIds) && data.newlyFailedCustomKeyIds.length > 0) {
                const updatedCustomFailed = recordFailedCustomKeyIds(data.newlyFailedCustomKeyIds);
                setFailedCustomKeysCount(updatedCustomFailed.length);
                const failedSet = new Set<string>(data.newlyFailedCustomKeyIds);
                const updatedKeys = keys.map(k => failedSet.has(k.id) ? { ...k, health: 'invalid' as const } : k);
                persistKeys(updatedKeys);
            }

            if (!isSystemKeySelected && data.usedCustomKeyId && data.usedCustomKeyId !== selectedKeyId) {
                handleSelectKey(data.usedCustomKeyId);
            }

            if (res.status === 403 && data.systemLocked) {
                handleLockSystem();
                setIsSettingsOpen(true);
            }

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch Adobe Stock data");
            }

            const resultItems: AdobeAssetItem[] = data.items || [];
            const newSummary: ContributorSummary | null = data.summary || null;

            applySearchResults(
                resultItems,
                newSummary,
                activeMode,
                targetPage,
                activeDateRange,
                data.message
            );

            await setCachedSearch({
                cacheKey,
                items: resultItems,
                summary: newSummary,
                ttlHours: cacheTtlHours
            });

            const updatedRecent = await upsertRecentSearch({
                query: trimmed,
                displayLabel: activeMode === 'contributor' ? (newSummary?.creatorName || trimmed) : trimmed,
                mode: activeMode,
                sortBy: activeSort,
                fileType: activeType,
                aiContent: activeAi,
                dateRange: activeDateRange,
                startDate: activeStart,
                endDate: activeEnd
            });
            setRecentSearches(updatedRecent);
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Search Failed",
                text: error.message || "Something went wrong while connecting to Adobe Stock / Apify.",
                confirmButtonColor: "#3b82f6"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(query, mode, sortBy, fileType, aiContent, 1);
    };

    const handleModeSwitch = (newMode: SearchMode) => {
        setMode(newMode);
        setItems([]);
        setSummary(null);
        setSearched(false);
        setCurrentPage(1);
        setDateRange("all");
        setSoldOnly(false);
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        if (searched && query.trim() && mode === 'contributor') {
            executeSearch(query, mode, newSort, fileType, aiContent, 1);
        }
    };

    const handleFileTypeChange = (newType: FileTypeFilter) => {
        setFileType(newType);
        if (searched && query.trim() && mode === 'contributor') {
            executeSearch(query, mode, sortBy, newType, aiContent, 1);
        }
    };

    const handleAiContentChange = (newAi: AiFilter) => {
        setAiContent(newAi);
        if (searched && query.trim() && mode === 'contributor') {
            executeSearch(query, mode, sortBy, fileType, newAi, 1);
        }
    };

    const handleDateRangeChange = (preset: DateRangePreset) => {
        setDateRange(preset);
        if (preset !== 'custom' && searched && query.trim() && mode === 'contributor') {
            executeSearch(query, mode, sortBy, fileType, aiContent, 1, preset, startDate, endDate);
        }
    };

    const handleApplyCustomRange = () => {
        if (!startDate || !endDate) return;
        if (searched && query.trim() && mode === 'contributor') {
            executeSearch(query, mode, sortBy, fileType, aiContent, 1, 'custom', startDate, endDate);
        }
    };

    const handleSelectRecentSearch = (entry: RecentSearchEntry) => {
        setMode(entry.mode);
        setQuery(entry.query);
        setSortBy(entry.sortBy);
        setFileType(entry.fileType);
        setAiContent(entry.aiContent);
        setDateRange(entry.dateRange);
        setStartDate(entry.startDate);
        setEndDate(entry.endDate);
        setSoldOnly(false);
        executeSearch(
            entry.query,
            entry.mode,
            entry.sortBy,
            entry.fileType,
            entry.aiContent,
            1,
            entry.dateRange,
            entry.startDate,
            entry.endDate
        );
    };

    const handleRemoveRecentSearch = async (id: string) => {
        const updated = await removeRecentSearch(id);
        setRecentSearches(updated);
    };

    const handleClearRecentSearches = async () => {
        await clearRecentSearches();
        setRecentSearches([]);
    };

    const displayedItems = soldOnly
        ? items.filter((item) => Number(item.downloads) > 0)
        : items;

    const downloadedItems = items.filter((item) => Number(item.downloads) > 0);
    const totalRangeDownloads = items.reduce((sum, item) => sum + (Number(item.downloads) || 0), 0);

    const handleDownloadAllSoldFiles = async () => {
        if (downloadedItems.length === 0) {
            Swal.fire({
                icon: "info",
                title: "No Downloaded Files",
                text: "There are no assets with downloads (> 0) on the current page to download.",
                confirmButtonColor: "#1473E6"
            });
            return;
        }

        setIsDownloadingZip(true);
        try {
            const res = await fetch("/api/adobe-tracker/download-zip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    creatorName: summary?.creatorName || "contributor",
                    creatorId: summary?.creatorId || "",
                    items: downloadedItems
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to generate ZIP file.");
            }

            const blob = await res.blob();
            const contentDisp = res.headers.get("Content-Disposition") || "";
            const filenameMatch = contentDisp.match(/filename="?([^"]+)"?/i);
            const filename = filenameMatch?.[1] || `${summary?.creatorName || "adobe_stock"}_downloaded_files.zip`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            Swal.fire({
                icon: "error",
                title: "Download Failed",
                text: err.message || "Could not download the files.",
                confirmButtonColor: "#1473E6"
            });
        } finally {
            setIsDownloadingZip(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-[#1473E6]/25 selection:text-foreground">
            {/* Main Container */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
                {/* Search & Filter Controls with Integrated Category Dropdown & Gear Settings */}
                <SearchControls
                    mode={mode}
                    onModeChange={handleModeSwitch}
                    query={query}
                    onQueryChange={setQuery}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    fileType={fileType}
                    onFileTypeChange={handleFileTypeChange}
                    aiContent={aiContent}
                    onAiContentChange={handleAiContentChange}
                    sortBy={sortBy}
                    onSortByChange={handleSortChange}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    selectedKey={selectedKey}
                />

                {/* Recent Searches Strip */}
                <RecentSearches
                    items={recentSearches}
                    isLoading={isLoading}
                    onSelect={handleSelectRecentSearch}
                    onRemove={handleRemoveRecentSearch}
                    onClearAll={handleClearRecentSearches}
                />

                {/* Layout-Matched Skeleton Loading */}
                {isLoading && <ResultsSkeleton mode={mode} />}

                {/* Contributor Profile Summary Card */}
                {!isLoading && summary && mode === 'contributor' && (
                    <ContributorCard summary={summary} />
                )}

                {/* Date Range Filter Banner (Contributor Mode after Search) */}
                {!isLoading && searched && summary && mode === 'contributor' && (
                    <DateRangeBanner
                        dateRange={dateRange}
                        onDateRangeChange={handleDateRangeChange}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onApplyCustomRange={handleApplyCustomRange}
                        soldOnly={soldOnly}
                        onSoldOnlyChange={setSoldOnly}
                        visibleCount={displayedItems.length}
                        totalRangeDownloads={totalRangeDownloads}
                        isLoading={isLoading}
                    />
                )}

                {/* Empty Range / Sold-Only State with Quick Actions */}
                {!isLoading && searched && mode === 'contributor' && displayedItems.length === 0 && (dateRange !== 'all' || soldOnly) && (
                    <div className="bg-card border border-border/80 rounded-none p-10 text-center flex flex-col items-center justify-center gap-3">
                        <p className="text-sm font-semibold text-foreground">
                            {soldOnly && items.length > 0
                                ? "No sold files (> 0 DL) in this upload period."
                                : "No recent uploads found in the selected date range."}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-md">
                            {soldOnly && items.length > 0
                                ? `Found ${items.length} uploads in this period, but none have downloads yet.`
                                : "Try expanding the upload period or resetting to All Time."}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                            {soldOnly && items.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSoldOnly(false)}
                                    className="px-4 py-2 bg-[#1473E6] hover:bg-[#0d66d0] text-white text-xs font-semibold rounded-none cursor-pointer transition-colors"
                                >
                                    Show All ({items.length})
                                </button>
                            )}
                            {dateRange === '7d' && (
                                <button
                                    type="button"
                                    onClick={() => handleDateRangeChange('1m')}
                                    className="px-4 py-2 bg-[#1473E6] hover:bg-[#0d66d0] text-white text-xs font-semibold rounded-none cursor-pointer transition-colors"
                                >
                                    Try Last 1 Month
                                </button>
                            )}
                            {dateRange !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSoldOnly(false);
                                        handleDateRangeChange('all');
                                    }}
                                    className="px-4 py-2 border border-border/80 bg-muted/40 hover:bg-muted text-foreground text-xs font-medium rounded-none cursor-pointer transition-colors"
                                >
                                    Reset to All Time
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {!isLoading && displayedItems.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground">
                                    {mode === 'contributor' ? 'Portfolio Assets' : 'Matched File Details'}
                                </h3>
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-none border border-border/60 font-medium">
                                    {displayedItems.length} {displayedItems.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              

                                {mode === 'contributor' && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadAllSoldFiles}
                                        disabled={isDownloadingZip || downloadedItems.length === 0}
                                        title={
                                            downloadedItems.length > 0
                                                ? `Download ${downloadedItems.length} downloaded assets & metadata CSV as ZIP`
                                                : "No downloaded assets (> 0 DL) on this page"
                                        }
                                        className="px-4 py-2 bg-[#1473E6] hover:bg-[#0d66d0] text-white text-xs font-semibold rounded-none flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                                    >
                                        {isDownloadingZip ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Preparing ZIP ({downloadedItems.length})...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Download Downloaded Files ({downloadedItems.length})</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Grid of Asset Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {displayedItems.map((asset) => (
                                <AssetCard
                                    key={asset.id}
                                    asset={asset}
                                    onSelect={setSelectedAsset}
                                />
                            ))}
                        </div>

                        {/* Pagination Bar (At the bottom of results, clean & responsive) */}
                        {mode === 'contributor' && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/80 text-xs">
                                <div className="text-muted-foreground">
                                    Showing Page <strong className="text-foreground">{currentPage}</strong>{summary?.totalPages ? <span> of <strong className="text-foreground">{summary.totalPages}</strong></span> : ""} • Loaded <strong className="text-foreground">{items.length}</strong> assets {summary?.totalAssets ? <span>(Total: {summary.totalAssets.toLocaleString()})</span> : ""}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={currentPage <= 1 || isLoading}
                                        onClick={() => {
                                            executeSearch(query, mode, sortBy, fileType, aiContent, currentPage - 1);
                                            window.scrollTo({ top: 250, behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2 border border-border/80 bg-card hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-none flex items-center gap-1.5 font-medium"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        <span>Previous Page</span>
                                    </button>

                                    <span className="px-3 py-2 font-mono font-bold bg-muted/60 border border-border/80 rounded-none text-foreground">
                                        Page {currentPage}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={isLoading || (summary?.hasNextPage !== undefined ? !summary.hasNextPage : items.length < 100)}
                                        onClick={() => {
                                            executeSearch(query, mode, sortBy, fileType, aiContent, currentPage + 1);
                                            window.scrollTo({ top: 250, behavior: 'smooth' });
                                        }}
                                        className="px-5 py-2 bg-[#1473E6] hover:bg-[#0d66d0] text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-none flex items-center gap-1.5 font-medium shadow-xs"
                                    >
                                        <span>Next Page</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Initial Blank State (Before search) */}
                {!isLoading && !searched && (
                    <div className="bg-muted/20 border border-border/60 border-dashed rounded-none p-12 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <FileSearch className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground text-base">
                            Ready to analyze Adobe Stock
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md">
                            Select <strong>Profile Tracker</strong> to inspect a creator’s entire portfolio metrics, or <strong>File ID Lookup</strong> to view verified downloads and keywords for a single file.
                        </p>
                    </div>
                )}

                {/* Asset Inspection Modal */}
                <AssetDetailsModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                />

                {/* API Settings Modal */}
                <ApiSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    keys={keys}
                    selectedKeyId={selectedKeyId}
                    onSelectKey={handleSelectKey}
                    onAddKey={handleAddKey}
                    onAddKeys={handleAddKeys}
                    onDeleteKey={handleDeleteKey}
                    onUpdateKey={handleUpdateKey}
                    failedKeysCount={failedKeysCount + failedCustomKeysCount}
                    onResetFailedKeys={() => {
                        clearFailedKeyIndices();
                        clearFailedCustomKeyIds();
                        setFailedKeysCount(0);
                        setFailedCustomKeysCount(0);
                        const restored = keys.map(k => k.token ? { ...k, health: 'active' as const } : k);
                        persistKeys(restored);
                    }}
                    isSystemUnlocked={Boolean(systemAccessTokenState)}
                    onUnlockSystem={handleUnlockSystem}
                    onLockSystem={handleLockSystem}
                />
            </div>
        </div>
    );
}
