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

const STORAGE_KEY = "nx-apify-keys";
const SELECTED_KEY_STORAGE = "nx-apify-selected-key";

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

    // Load saved keys from localStorage on mount
    useEffect(() => {
        try {
            const savedKeysJson = localStorage.getItem(STORAGE_KEY);
            let loadedKeys: ApifyKeyRecord[] = [];
            if (savedKeysJson) {
                loadedKeys = JSON.parse(savedKeysJson);
            }
            if (!Array.isArray(loadedKeys) || loadedKeys.length === 0) {
                loadedKeys = [DEFAULT_INITIAL_KEY];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedKeys));
            }
            setKeys(loadedKeys);

            const savedSelectedId = localStorage.getItem(SELECTED_KEY_STORAGE);
            if (savedSelectedId && loadedKeys.some(k => k.id === savedSelectedId)) {
                setSelectedKeyId(savedSelectedId);
            } else {
                const firstId = loadedKeys[0]?.id || null;
                setSelectedKeyId(firstId);
                if (firstId) localStorage.setItem(SELECTED_KEY_STORAGE, firstId);
            }
        } catch (_) {
            setKeys([DEFAULT_INITIAL_KEY]);
            setSelectedKeyId(DEFAULT_INITIAL_KEY.id);
        }
    }, []);

    // Save keys updates
    const handleAddKey = (newKey: ApifyKeyRecord) => {
        const updated = [...keys.filter(k => k.id !== newKey.id), newKey];
        setKeys(updated);
        setSelectedKeyId(newKey.id);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            localStorage.setItem(SELECTED_KEY_STORAGE, newKey.id);
        } catch (_) {}
    };

    const handleDeleteKey = (id: string) => {
        const updated = keys.filter(k => k.id !== id);
        setKeys(updated);
        const nextSelected = updated.length > 0 ? updated[0]?.id || null : null;
        setSelectedKeyId(nextSelected);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            if (nextSelected) localStorage.setItem(SELECTED_KEY_STORAGE, nextSelected);
            else localStorage.removeItem(SELECTED_KEY_STORAGE);
        } catch (_) {}
    };

    const handleSelectKey = (id: string) => {
        setSelectedKeyId(id);
        try {
            localStorage.setItem(SELECTED_KEY_STORAGE, id);
        } catch (_) {}
    };

    const handleUpdateKey = (updatedKey: ApifyKeyRecord) => {
        const updated = keys.map(k => k.id === updatedKey.id ? updatedKey : k);
        setKeys(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
    };

    const selectedKey = keys.find(k => k.id === selectedKeyId) || null;

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

        setIsLoading(true);
        setSearched(true);
        setCurrentPage(targetPage);

        try {
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
                    apiKey: selectedKey?.token
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch Adobe Stock data");
            }

            setItems(data.items || []);
            const newSummary = data.summary || null;
            if (newSummary) {
                if (targetPage > 1) {
                    // Only on pagination within the same query & filter
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
                    // Fresh search or filter change (e.g. photos, vectors, videos) — use authentic metrics for this category
                    setSummary(newSummary);
                }
            } else {
                setSummary(null);
            }

            if ((!data.items || data.items.length === 0) && activeDateRange === 'all') {
                Swal.fire({
                    icon: "info",
                    title: "No Results",
                    text: data.message || "No matching assets found for this search.",
                    confirmButtonColor: "#3b82f6"
                });
            }
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
        <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
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
                {!isLoading && searched && mode === 'contributor' && displayedItems.length === 0 && (
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
                    onDeleteKey={handleDeleteKey}
                    onUpdateKey={handleUpdateKey}
                />
            </div>
        </div>
    );
}
