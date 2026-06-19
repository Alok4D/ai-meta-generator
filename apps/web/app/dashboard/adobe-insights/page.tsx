"use client";

import { useState } from "react";
import { useSearchImstockerMutation } from "@/lib/feature/iamstock/iamstockApi";
import { toast } from "sonner";
import { SearchBar } from "./_components/SearchBar";
import { WorkGrid } from "./_components/WorkGrid";
import { KeywordPanel } from "./_components/KeywordPanel";

const IAMStockPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [isLimitReached, setIsLimitReached] = useState(false);
    const [typeFilter, setTypeFilter] = useState("any");
    const [layoutMode, setLayoutMode] = useState<'list' | 'grid' | 'half'>('grid');
    const [searchImstocker, { isLoading, data }] = useSearchImstockerMutation();

    const [selectedWorkIds, setSelectedWorkIds] = useState<number[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.error("Please enter a search term");
            return;
        }

        try {
            const selectedType = typeFilter === "any" ? undefined : [parseInt(typeFilter)];
            await searchImstocker({ search: searchTerm, sessionId, count: 100, type: selectedType }).unwrap();
            toast.success("Search completed!");
            // Reset selections on new search
            setSelectedWorkIds([]);
            setSelectedKeywords([]);
        } catch (error: any) {
            const errorMsg = error?.data?.error || error?.data?.message || error?.error || error?.message || "Failed to fetch data from IMStocker";
            toast.error(errorMsg);
            if (errorMsg.includes('API_FLOOD') || errorMsg.includes('Rate limit')) {
                setIsLimitReached(true);
            }
        }
    };

    const handleToggleWork = (id: number) => {
        setSelectedWorkIds(prev => 
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        );
    };

    const handleSelectAllWorks = () => {
        if (data?.res?.list) {
            setSelectedWorkIds(data.res.list.map((w: any) => w.id_work));
        }
    };

    const handleSelectNoneWorks = () => {
        setSelectedWorkIds([]);
    };

    const handleToggleKeyword = (keyword: string) => {
        setSelectedKeywords(prev => 
            prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
        );
    };

    const handleClearKeywords = () => {
        setSelectedKeywords([]);
    };

    const works = data?.res?.list || [];
    const selectedWorksFull = works.filter((w: any) => selectedWorkIds.includes(w.id_work));

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] -m-4 md:-m-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Top Search Area */}
            <div 
                className="p-4 border-b border-gray-200 dark:border-gray-800 z-10 shrink-0 shadow-sm bg-cover bg-center"
                style={{ backgroundImage: "url('/adobe-insight-banner-top.webp')" }}
            >
                <div className="max-w-7xl mx-auto flex gap-4 items-center">
                    <SearchBar 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        sessionId={sessionId}
                        setSessionId={setSessionId}
                        isLimitReached={isLimitReached}
                        isLoading={isLoading}
                        onSearch={handleSearch}
                    />
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left side: Image Grid */}
                <div className={`w-full ${layoutMode === 'half' ? 'lg:w-[100%]' : 'lg:w-[60%]'} flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden transition-all duration-300`}>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <WorkGrid 
                            works={works} 
                            selectedWorkIds={selectedWorkIds} 
                            onToggleWork={handleToggleWork}
                            onSelectAll={handleSelectAllWorks}
                            onSelectNone={handleSelectNoneWorks}
                            layoutMode={layoutMode}
                            onLayoutChange={setLayoutMode}
                        />
                    </div>
                </div>

                {/* Right side: Keyword Panel */}
                {layoutMode !== 'half' && (
                    <div className="w-full lg:w-[40%] flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden transition-all duration-300">
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <KeywordPanel 
                                selectedWorks={selectedWorksFull}
                                selectedKeywords={selectedKeywords}
                                onToggleKeyword={handleToggleKeyword}
                                onClearKeywords={handleClearKeywords}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IAMStockPage;