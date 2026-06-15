"use client";

import { useState } from "react";
import { useSearchImstockerMutation } from "@/lib/feature/iamstock/iamstockApi";
import { Search, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const IAMStockPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [typeFilter, setTypeFilter] = useState("any");
    const [searchImstocker, { isLoading, data }] = useSearchImstockerMutation();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            toast.error("Please enter a search term");
            return;
        }

        try {
            const selectedType = typeFilter === "any" ? undefined : [parseInt(typeFilter)];
            await searchImstocker({ search: searchTerm, sessionId, count: 100, type: selectedType }).unwrap();
            toast.success("Search completed!");
        } catch (error: any) {
            toast.error(error?.data?.message || error?.error || "Failed to fetch data from IMStocker");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">IAMStock Search</h1>
                <p className="text-gray-500 dark:text-gray-400">Search for works and extract trending keywords.</p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 max-w-2xl">
                <div className="flex w-full items-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <div className="pl-4 pr-2 text-gray-400">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for works..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-2 py-4 bg-transparent outline-none dark:text-gray-100 placeholder-gray-400"
                    />
                    
                    <div className="border-l border-gray-200 dark:border-gray-700 flex items-center h-full px-3">
                        <span className="text-sm text-gray-500 mr-2">Type:</span>
                        <select 
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer py-4"
                        >
                            <option value="any">Any</option>
                            <option value="1">Photo</option>
                            <option value="2">Illustration</option>
                            <option value="3">Vector</option>
                            <option value="4">Video</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Search"}
                    </button>
                </div>
                
                <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-medium text-gray-500">Session ID:</span>
                    <input
                        type="text"
                        placeholder="keyworder_session (Optional)"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        className="text-xs w-64 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    />
                </div>
            </form>

            {data && data.res && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                        Results {data.res.total !== undefined ? `(${data.res.total})` : ''}
                    </h2>
                    {data.res.list && data.res.list.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {data.res.list.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 transition-all group">
                                    <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
                                        {item.small_preview_link_work || item.big_preview_link_work ? (
                                            <img 
                                                src={item.small_preview_link_work || item.big_preview_link_work} 
                                                alt={item.title_work || 'Work'} 
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col gap-3">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-relaxed" title={item.title_work}>
                                            {item.title_work || "Untitled"}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                                            {item.keywords && Array.isArray(item.keywords) && item.keywords.slice(0, 4).map((kw: any, i: number) => (
                                                <span key={i} className="px-2.5 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-[11px] font-medium rounded-lg text-gray-600 dark:text-gray-300">
                                                    {kw.title_keyword || kw}
                                                </span>
                                            ))}
                                            {item.keywords && Array.isArray(item.keywords) && item.keywords.length > 4 && (
                                                <span className="px-2.5 py-1 text-[11px] font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    +{item.keywords.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-500 border border-gray-200 border-dashed dark:border-gray-700">
                            No results found for "{searchTerm}".
                        </div>
                    )}
                </div>
            )}
            
            {/* Fallback if the data structure is different */}
            {data && !data.res && (
                 <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 overflow-auto border border-gray-200 dark:border-gray-700">
                     <p className="text-sm font-medium text-gray-500 mb-4">Raw Response Data:</p>
                     <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono">{JSON.stringify(data, null, 2)}</pre>
                 </div>
            )}
        </div>
    );
};

export default IAMStockPage;