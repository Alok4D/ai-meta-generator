"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    Search, MapPin, Grid, Briefcase, ExternalLink, RefreshCw, 
    Sparkles, Copy, Check, X, Tag, Maximize2, Flame, TrendingUp, Clock,
    Layers, Filter, ArrowUpDown
} from "lucide-react";
import Swal from "sweetalert2";

export default function ContributorInsights() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("nb_downloads");

    // Modal State
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [assetDetails, setAssetDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const fetchProfile = async (
        pageToFetch: number, 
        activeFilter: string = filterType,
        activeSort: string = sortBy
    ) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/contributor-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    search: searchTerm, 
                    page: pageToFetch, 
                    filterType: activeFilter,
                    sortBy: activeSort
                }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch profile");
            }

            setProfileData(data);
            setCurrentPage(pageToFetch);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Something went wrong',
                confirmButtonColor: '#3b82f6'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        fetchProfile(1, filterType, sortBy);
    };

    const handleFilterChange = (newFilter: string) => {
        setFilterType(newFilter);
        if (searchTerm.trim() && profileData) {
            fetchProfile(1, newFilter, sortBy);
        }
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        if (searchTerm.trim() && profileData) {
            fetchProfile(1, filterType, newSort);
        }
    };

    const handleOpenAssetModal = async (asset: any) => {
        setSelectedAsset(asset);
        setAssetDetails(null);
        setIsLoadingDetails(true);
        setIsCopied(false);

        if (!asset.id) {
            setIsLoadingDetails(false);
            return;
        }

        try {
            const res = await fetch("/api/asset-details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assetId: asset.id }),
            });
            const data = await res.json();
            if (res.ok) {
                setAssetDetails(data);
            }
        } catch (err) {
            console.error("Failed to fetch asset details:", err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCopyKeywords = (keywordsToCopy: string[]) => {
        if (!keywordsToCopy || keywordsToCopy.length === 0) return;
        navigator.clipboard.writeText(keywordsToCopy.join(", "));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleNextPage = () => fetchProfile(currentPage + 1, filterType, sortBy);
    const handlePrevPage = () => fetchProfile(currentPage > 1 ? currentPage - 1 : 1, filterType, sortBy);

    const formatAssetCount = (countStr: string | number) => {
        const count = String(countStr || "0").replace(/,/g, '');
        if (count === "0" && profileData?.latestAssets?.length > 0) {
            return `${profileData.latestAssets.length}+`;
        }
        return countStr;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#090D16] pt-28 pb-20 text-slate-900 dark:text-slate-100 antialiased">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Title Section */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Top Performing Adobe Stock Insights
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                        Contributor Profile <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">Explorer</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                        Discover top downloaded assets, inspect real keywords, explore AI-generated portfolios, and analyze contributor performance in real-time.
                    </p>
                </div>

                {/* Search & Filter Control Center */}
                <div className="max-w-3xl mx-auto mb-10">
                    <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-3.5">
                        
                        {/* Search Input Bar */}
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Paste Adobe Stock contributor URL or Creator ID..."
                                className="w-full pl-11 pr-28 sm:pr-32 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm sm:text-base transition-all placeholder:text-slate-400"
                            />
                            <button
                                id="search-submit-btn"
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Analyze"
                                )}
                            </button>
                        </form>

                        {/* Controls Bar: Sort (Left) & Filter (Right) */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                            
                            {/* Sort Options Segmented Control */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl">
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 flex items-center gap-1">
                                    <ArrowUpDown className="w-3 h-3" /> Sort:
                                </span>
                                {[
                                    { id: "nb_downloads", label: "Most Downloaded", icon: Flame, color: "text-amber-500" },
                                    { id: "relevance", label: "Relevant", icon: TrendingUp, color: "text-blue-500" },
                                    { id: "creation", label: "Newest", icon: Clock, color: "text-emerald-500" },
                                ].map((s) => {
                                    const Icon = s.icon;
                                    const active = sortBy === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => handleSortChange(s.id)}
                                            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                                                active
                                                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                        >
                                            <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Content Type Filters */}
                            <div className="flex items-center justify-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                                {[
                                    { id: "all", label: "All" },
                                    { id: "photos", label: "Photos" },
                                    { id: "vectors", label: "Vectors" },
                                    { id: "illustrations", label: "Illustrations" },
                                    { id: "videos", label: "Videos" },
                                ].map((tab) => {
                                    const active = filterType === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => handleFilterChange(tab.id)}
                                            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                                                active
                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Loading State Animation */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                        <div className="relative w-14 h-14">
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                            Fetching portfolio & analyzing top downloaded assets...
                        </p>
                    </div>
                )}

                {/* Profile Results Section */}
                {profileData && !isLoading && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Contributor Profile Header Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                            
                            {/* Avatar */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md shrink-0 bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl tracking-wider">
                                {profileData.avatarUrl && !profileData.avatarUrl.includes('spacer.gif') ? (
                                    <Image
                                        src={profileData.avatarUrl}
                                        alt={profileData.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span>
                                        {profileData.name ? profileData.name.substring(0, 2).toUpperCase() : "AS"}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5">
                                    {profileData.name}
                                </h2>
                                
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        Adobe Stock Contributor
                                    </div>
                                    {profileData.location && profileData.location !== "Location not public" && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {profileData.location}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Stats Box & Visit Profile */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center sm:text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Total Assets
                                    </span>
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                        {formatAssetCount(profileData.assetsCount)}
                                    </span>
                                </div>

                                <a
                                    href={profileData.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all shadow-sm"
                                >
                                    Visit Profile <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                        </div>

                        {/* Assets Grid Card */}
                        {profileData.latestAssets && profileData.latestAssets.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none">
                                
                                {/* Section Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Grid className="w-4 h-4 text-blue-500" />
                                            Portfolio Assets (Page {currentPage})
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Click any asset to inspect real Adobe Stock keywords and meta tags.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            {sortBy === "nb_downloads" ? "Sorted by Most Downloaded" : sortBy === "relevance" ? "Sorted by Relevance" : "Sorted by Newest"}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                            {profileData.latestAssets.length} items
                                        </span>
                                    </div>
                                </div>

                                {/* Asset Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                                    {profileData.latestAssets.map((asset: any, idx: number) => {
                                        const rankNumber = (currentPage - 1) * 100 + idx + 1;
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => handleOpenAssetModal(asset)}
                                                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-500/60 transition-all duration-300"
                                            >
                                                <Image
                                                    src={asset.thumbnailUrl || asset.src}
                                                    alt={asset.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized
                                                />

                                                {/* Top Badges */}
                                                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                                                    {/* Rank badge */}
                                                    {sortBy === "nb_downloads" ? (
                                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm backdrop-blur-md flex items-center gap-1 ${
                                                            rankNumber <= 3 
                                                                ? "bg-amber-500 text-slate-950" 
                                                                : "bg-slate-900/80 text-white"
                                                        }`}>
                                                            {rankNumber <= 3 && <Flame className="w-2.5 h-2.5 fill-current" />}
                                                            #{rankNumber}
                                                        </span>
                                                    ) : <div />}

                                                    {/* AI Badge */}
                                                    {asset.isGenTech && (
                                                        <span className="bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                                                            <Sparkles className="w-2.5 h-2.5" /> AI
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Inspect Hover Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                    <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-2">
                                                        {asset.title}
                                                    </p>
                                                    <div className="flex items-center justify-between text-[11px] text-blue-300 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Maximize2 className="w-3 h-3" /> Inspect Keywords
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {(Number(profileData.assetsCount?.replace(/,/g, '') || 0) > profileData.latestAssets.length || profileData.latestAssets.length >= 20) && (
                                    <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1 || isLoading}
                                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Page {currentPage} of {Math.ceil(Number(profileData.assetsCount?.replace(/,/g, '') || 0) / 100) || 1}
                                        </span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage >= Math.ceil(Number(profileData.assetsCount?.replace(/,/g, '') || 0) / 100) || isLoading || profileData.latestAssets.length < 100}
                                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            Next Page
                                        </button>
                                    </div>
                                )}

                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Asset Inspector Modal */}
            {selectedAsset && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setSelectedAsset(null)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1.5 rounded-xl">
                                    <Tag className="w-4 h-4" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Asset Details & Keywords
                                    </h4>
                                    <p className="text-[11px] text-slate-400">ID: #{selectedAsset.id || "N/A"}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAsset(null)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-5">
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                
                                {/* Image Preview */}
                                <div className="md:col-span-5 flex flex-col items-center">
                                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                                        <Image
                                            src={assetDetails?.thumbLargeUrl || selectedAsset.largePreviewUrl || selectedAsset.thumbnailUrl || selectedAsset.src}
                                            alt={selectedAsset.title}
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                    </div>
                                </div>

                                {/* Details & Meta */}
                                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-3">
                                            {assetDetails?.title || selectedAsset.title}
                                        </h3>

                                        {/* Quick Meta Pills */}
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                                    {assetDetails?.category || "Graphic"}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Type</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {assetDetails?.assetType || (selectedAsset.contentType === 3 ? "Vector" : selectedAsset.contentType === 4 ? "Video" : "Photo")}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">AI Gen</span>
                                                <span className={`font-semibold flex items-center gap-1 ${
                                                    (assetDetails?.isGenTech ?? selectedAsset.isGenTech) ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-300"
                                                }`}>
                                                    {(assetDetails?.isGenTech ?? selectedAsset.isGenTech) ? <><Sparkles className="w-3 h-3" /> Yes</> : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex items-center gap-2.5 pt-1">
                                        <a
                                            href={assetDetails?.contentUrl || selectedAsset.assetUrl || `https://stock.adobe.com/${selectedAsset.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                                        >
                                            View on Adobe Stock <ExternalLink className="w-3.5 h-3.5" />
                                        </a>

                                        <Link
                                            href="/dashboard/generator"
                                            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> AI Generator
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Keywords Section */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                                        Adobe Stock Real Keywords {isLoadingDetails ? "(Loading...)" : `(${assetDetails?.keywords?.length || selectedAsset.keywords?.length || 0})`}
                                    </h4>

                                    {((assetDetails?.keywords && assetDetails.keywords.length > 0) || (selectedAsset.keywords && selectedAsset.keywords.length > 0)) && (
                                        <button
                                            onClick={() => handleCopyKeywords(assetDetails?.keywords || selectedAsset.keywords)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-xl transition-colors"
                                        >
                                            {isCopied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                                        </button>
                                    )}
                                </div>

                                {isLoadingDetails ? (
                                    <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                                        Fetching accurate Adobe Stock keywords...
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1">
                                        {(assetDetails?.keywords || selectedAsset.keywords || []).map((keyword: string, kIdx: number) => (
                                            <span 
                                                key={kIdx} 
                                                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 font-medium select-all"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
