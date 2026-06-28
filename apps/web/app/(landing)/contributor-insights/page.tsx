"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Grid, Camera, Briefcase, ExternalLink, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

export default function ContributorInsights() {
    
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [filterType, setFilterType] = useState("all");

    const fetchProfile = async (pageToFetch: number) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/contributor-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: searchTerm, page: pageToFetch, filterType }),
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
        fetchProfile(1);
    };

    // Re-fetch when filter changes if we already have a search term
    const handleFilterChange = (newFilter: string) => {
        setFilterType(newFilter);
        if (searchTerm.trim() && profileData) {
            // Slight delay to allow state to update before fetch
            setTimeout(() => {
                const btn = document.getElementById('search-submit-btn');
                if (btn) btn.click();
            }, 10);
        }
    };

    const handleNextPage = () => fetchProfile(currentPage + 1);
    const handlePrevPage = () => fetchProfile(currentPage > 1 ? currentPage - 1 : 1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-28 pb-12">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Contributor Profile <span className="text-blue-500">Explorer</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                        Paste any Adobe Stock contributor URL or ID to analyze their public portfolio, assets, and latest uploads.
                    </p>
                </div>

                {/* Search Bar & Filters */}
                <div className="max-w-3xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="e.g., https://stock.adobe.com/contributor/204780517 or 204780517"
                                className="w-full pl-12 pr-32 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 dark:text-white"
                            />
                            <button
                                id="search-submit-btn"
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 top-2 bottom-2 bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-xl transition-colors flex items-center gap-2 font-medium"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Analyze"}
                            </button>
                        </div>
                        
                        <select 
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full sm:w-auto px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm appearance-none min-w-[140px]"
                        >
                            <option value="all">All Assets</option>
                            <option value="photos">Photos</option>
                            <option value="vectors">Vectors</option>
                            <option value="illustrations">Illustrations</option>
                            <option value="videos">Videos</option>
                        </select>
                    </form>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="mt-6 text-gray-500 font-medium">Bypassing security & fetching profile data...</p>
                    </div>
                )}

                {/* Profile Results */}
                {profileData && !isLoading && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        {/* Profile Header Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            {/* Subtle Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
                            
                            {/* Avatar */}
                            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
                                        {profileData.name.substring(0, 2)}
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
                                            {profileData.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    {profileData.location}
                                                </div>
                                            )}
                                            {profileData.location && <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>}
                                            <div className="flex items-center gap-1.5 text-blue-500">
                                                <Briefcase className="w-4 h-4" />
                                                Adobe Stock Contributor
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action */}
                                    <div className="shrink-0 flex items-center justify-center gap-4">
                                        {/* Stats Badge */}
                                        <div className="flex flex-col items-center md:items-end justify-center px-4 py-2 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20">
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Total Assets</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                                                {profileData.assetsCount}
                                            </p>
                                        </div>
                                        <a 
                                            href={profileData.sourceUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm"
                                        >
                                            Visit Profile
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Assets Grid */}
                        {profileData.latestAssets && profileData.latestAssets.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Grid className="w-5 h-5 text-blue-500" />
                                        Assets (Page {currentPage})
                                    </h3>
                                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                        Showing {profileData.latestAssets.length} items
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {profileData.latestAssets.map((asset: any, idx: number) => (
                                        <div key={idx} className="group relative aspect-square rounded-none overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <Image
                                                src={asset.thumbnailUrl || asset.src}
                                                alt={asset.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                unoptimized
                                            />
                                            {/* Top badges */}
                                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {asset.isGenTech && (
                                                    <span className="bg-purple-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                        Generative AI
                                                    </span>
                                                )}
                                                <a 
                                                    href={asset.assetUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="bg-black/50 hover:bg-blue-500 backdrop-blur-md text-white p-1.5 rounded-full transition-colors ml-auto"
                                                    title="View on Adobe Stock"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>

                                            {/* Bottom Info */}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-white text-xs line-clamp-2 font-medium leading-relaxed">
                                                    {asset.title}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {(Number(profileData.assetsCount?.replace(/,/g, '') || 0) > profileData.latestAssets.length || profileData.latestAssets.length >= 20) && (
                                    <div className="flex items-center justify-center gap-4 mt-10">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1 || isLoading}
                                            className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Page {currentPage} of {Math.ceil(Number(profileData.assetsCount?.replace(/,/g, '') || 0) / 100)}
                                        </span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage >= Math.ceil(Number(profileData.assetsCount?.replace(/,/g, '') || 0) / 100) || isLoading || profileData.latestAssets.length < 100}
                                            className="px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
}
