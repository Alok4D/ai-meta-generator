"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    Search, MapPin, Grid, Briefcase, ExternalLink, RefreshCw, 
    Sparkles, Copy, Check, X, Tag, Maximize2, Flame, TrendingUp, Clock,
    ArrowUpDown
} from "lucide-react";
import Swal from "sweetalert2";

export default function ContributorInsights() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("nb_downloads"); // Default to Most Downloaded

    // Asset Detail Modal State
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

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-28 pb-16 text-gray-900 dark:text-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                            <Flame className="w-3.5 h-3.5 text-amber-500" /> Top Performing Adobe Stock Insights
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Contributor Profile <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">Explorer</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                            Discover top downloaded assets, inspect real keywords, explore AI-generated portfolios, and analyze contributor performance.
                        </p>
                    </div>

                    {/* Search Bar & Controls */}
                    <div className="max-w-3xl mx-auto mb-10">
                        <form onSubmit={handleSearch} className="relative flex flex-col gap-4">
                            <div className="relative w-full shadow-lg shadow-blue-500/5 rounded-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="e.g., https://stock.adobe.com/contributor/204780517 or 204780517"
                                    className="w-full pl-12 pr-32 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all text-sm sm:text-base"
                                />
                                <button
                                    id="search-submit-btn"
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 sm:px-6 rounded-xl transition-all flex items-center gap-2 font-medium shadow-md shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Analyze"}
                                </button>
                            </div>

                            {/* Sort & Filter Bar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                
                                {/* Sort Options */}
                                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 p-1 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <span className="text-[11px] font-bold text-gray-400 px-2 flex items-center gap-1">
                                        <ArrowUpDown className="w-3 h-3" /> Sort:
                                    </span>
                                    {[
                                        { id: "nb_downloads", label: "Most Downloaded", icon: Flame, color: "text-amber-500" },
                                        { id: "relevance", label: "Top Relevant", icon: TrendingUp, color: "text-blue-500" },
                                        { id: "creation", label: "Newest", icon: Clock, color: "text-emerald-500" },
                                    ].map((s) => {
                                        const Icon = s.icon;
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => handleSortChange(s.id)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                                                    sortBy === s.id
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                            >
                                                <Icon className={`w-3.5 h-3.5 ${sortBy === s.id ? "text-white" : s.color}`} />
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Content Type Filter Pills */}
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    {[
                                        { id: "all", label: "All" },
                                        { id: "photos", label: "Photos" },
                                        { id: "vectors", label: "Vectors" },
                                        { id: "illustrations", label: "Illustrations" },
                                        { id: "videos", label: "Videos" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => handleFilterChange(tab.id)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                                                filterType === tab.id
                                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-sm"
                                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                            </div>
                        </form>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-5 text-gray-500 dark:text-gray-400 font-medium text-sm">
                                Fetching top-performing contributor assets...
                            </p>
                        </div>
                    )}

                    {/* Profile Results */}
                    {profileData && !isLoading && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Profile Header Card */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
                                
                                {/* Avatar */}
                                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    {profileData.avatarUrl && !profileData.avatarUrl.includes('spacer.gif') ? (
                                        <Image
                                            src={profileData.avatarUrl}
                                            alt={profileData.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold text-white uppercase tracking-wider">
                                            {profileData.name ? profileData.name.substring(0, 2) : "AS"}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="relative flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                {profileData.name}
                                            </h2>
                                            
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                {profileData.location && profileData.location !== "Location not public" && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                        {profileData.location}
                                                    </div>
                                                )}
                                                {profileData.location && profileData.location !== "Location not public" && <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>}
                                                <div className="flex items-center gap-1.5 text-blue-500">
                                                    <Briefcase className="w-4 h-4" />
                                                    Adobe Stock Contributor
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Action & Stats */}
                                        <div className="shrink-0 flex items-center justify-center gap-3">
                                            <div className="flex flex-col items-center md:items-end justify-center px-4 py-2 bg-blue-50/70 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">Total Assets</p>
                                                <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">
                                                    {profileData.assetsCount}
                                                </p>
                                            </div>
                                            <a 
                                                href={profileData.sourceUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-4 sm:px-5 py-3 rounded-xl font-semibold transition-all shadow-sm text-sm"
                                            >
                                                Visit Profile
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assets Grid */}
                            {profileData.latestAssets && profileData.latestAssets.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Grid className="w-5 h-5 text-blue-500" />
                                                Portfolio Assets (Page {currentPage})
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Sorted by <span className="font-semibold text-blue-500">{sortBy === "nb_downloads" ? "Most Downloaded / Top Selling" : sortBy === "relevance" ? "Most Relevant" : "Newest"}</span>. Click any asset to inspect real keywords.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <Flame className="w-3.5 h-3.5 text-amber-500" />
                                                {sortBy === "nb_downloads" ? "Top Downloads First" : "Sorted by " + sortBy}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                Showing {profileData.latestAssets.length} items
                                            </span>
                                        </div>
                                    </div>

                                    {/* Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {profileData.latestAssets.map((asset: any, idx: number) => {
                                            const rankNumber = (currentPage - 1) * 100 + idx + 1;
                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => handleOpenAssetModal(asset)}
                                                    className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
                                                >
                                                    <Image
                                                        src={asset.thumbnailUrl || asset.src}
                                                        alt={asset.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        unoptimized
                                                    />

                                                    {/* Top Badges */}
                                                    <div className="absolute top-2 left-2 right-2 flex flex-wrap justify-between items-start gap-1.5 z-10">
                                                        {/* Rank badge */}
                                                        {sortBy === "nb_downloads" && (
                                                            <span className={`text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-md flex items-center gap-1 ${
                                                                rankNumber <= 3 
                                                                    ? "bg-amber-500/90 text-amber-950" 
                                                                    : "bg-black/60 text-white"
                                                            }`}>
                                                                {rankNumber <= 3 && <Flame className="w-2.5 h-2.5 fill-current" />}
                                                                #{rankNumber}
                                                            </span>
                                                        )}

                                                        {/* AI Badge */}
                                                        {asset.isGenTech && (
                                                            <span className="bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 ml-auto">
                                                                <Sparkles className="w-2.5 h-2.5" /> AI Gen
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Quick Inspect Hover Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-2">
                                                            {asset.title}
                                                        </p>
                                                        <div className="flex items-center justify-between text-[11px] text-blue-300 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <Maximize2 className="w-3 h-3" /> Inspect Keywords
                                                            </span>
                                                            <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px]">
                                                                ID: {asset.id || "View"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination Controls */}
                                    {(Number(profileData.assetsCount?.replace(/,/g, '') || 0) > profileData.latestAssets.length || profileData.latestAssets.length >= 20) && (
                                        <div className="flex items-center justify-center gap-4 mt-10 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={currentPage === 1 || isLoading}
                                                className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Page {currentPage} of {Math.ceil(Number(profileData.assetsCount?.replace(/,/g, '') || 0) / 100) || 1}
                                            </span>
                                            <button
                                                onClick={handleNextPage}
                                                disabled={currentPage >= Math.ceil(Number(profileData.assetsCount?.replace(/,/g, '') || 0) / 100) || isLoading || profileData.latestAssets.length < 100}
                                                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
            </div>

            {/* Asset Inspector Modal */}
            {selectedAsset && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setSelectedAsset(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg">
                                    <Tag className="w-4 h-4" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Asset Details & Keywords Inspector
                                    </h4>
                                    <p className="text-[11px] text-gray-500">Asset ID: #{selectedAsset.id || "N/A"}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAsset(null)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            
                            {/* Top Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                
                                {/* Image Preview */}
                                <div className="md:col-span-5 flex flex-col items-center">
                                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3">
                                            {assetDetails?.title || selectedAsset.title}
                                        </h3>

                                        {/* Quick Meta Pills */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Category</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block">
                                                    {assetDetails?.category || "Graphic Resources"}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Asset Type</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {assetDetails?.assetType || (selectedAsset.contentType === 3 ? "Vector" : selectedAsset.contentType === 4 ? "Video" : "Photo")}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Generative AI</span>
                                                <span className={`font-semibold flex items-center gap-1 ${
                                                    (assetDetails?.isGenTech ?? selectedAsset.isGenTech) ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"
                                                }`}>
                                                    {(assetDetails?.isGenTech ?? selectedAsset.isGenTech) ? <><Sparkles className="w-3 h-3" /> Yes</> : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <a
                                            href={assetDetails?.contentUrl || selectedAsset.assetUrl || `https://stock.adobe.com/${selectedAsset.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                                        >
                                            View on Adobe Stock <ExternalLink className="w-3.5 h-3.5" />
                                        </a>

                                        <Link
                                            href="/dashboard/generator"
                                            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-purple-500/10"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> AI Generator
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Keywords Section */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-blue-500" />
                                        Adobe Stock Real Keywords {isLoadingDetails ? "(Loading...)" : `(${assetDetails?.keywords?.length || selectedAsset.keywords?.length || 0})`}
                                    </h4>

                                    {((assetDetails?.keywords && assetDetails.keywords.length > 0) || (selectedAsset.keywords && selectedAsset.keywords.length > 0)) && (
                                        <button
                                            onClick={() => handleCopyKeywords(assetDetails?.keywords || selectedAsset.keywords)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {isCopied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All Keywords</>}
                                        </button>
                                    )}
                                </div>

                                {isLoadingDetails ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                                        <span className="text-xs text-gray-400">Fetching accurate Adobe Stock keywords...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                        {(assetDetails?.keywords || selectedAsset.keywords || []).map((keyword: string, kIdx: number) => (
                                            <span 
                                                key={kIdx} 
                                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700/80 font-medium select-all"
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
        </>
    );
}
