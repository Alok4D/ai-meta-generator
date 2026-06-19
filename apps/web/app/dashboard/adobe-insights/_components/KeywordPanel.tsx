import React, { useMemo, useState } from 'react';
import { X, Copy, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface KeywordPanelProps {
    selectedWorks: any[];
    selectedKeywords: string[];
    onToggleKeyword: (keyword: string) => void;
    onClearKeywords: () => void;
}

export const KeywordPanel: React.FC<KeywordPanelProps> = ({
    selectedWorks,
    selectedKeywords,
    onToggleKeyword,
    onClearKeywords
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    console.log(activeFilters)

    // Aggregate keywords from selected works
    const suggestedKeywords = useMemo(() => {
        if (selectedWorks.length === 0) return [];

        const keywordDataMap: Record<string, { keyword: string, count: number, raw: any }> = {};
        
        selectedWorks.forEach(work => {
            if (work.keywords && Array.isArray(work.keywords)) {
                work.keywords.forEach((kw: any) => {
                    const title = kw.title_keyword.toLowerCase();
                    if (!keywordDataMap[title]) {
                        keywordDataMap[title] = { keyword: title, count: 1, raw: kw };
                    } else {
                        keywordDataMap[title].count++;
                    }
                });
            }
        });

        // Convert to array, sort by count (descending), then alphabetically
        return Object.values(keywordDataMap)
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.keyword.localeCompare(b.keyword);
            });
    }, [selectedWorks]);

    const filteredKeywords = useMemo(() => {
        if (activeFilters.length === 0) return suggestedKeywords;
        
        return suggestedKeywords.filter(({ raw }) => {
            const rank = parseFloat(raw?.result_rank);
            const isUnknown = !raw || raw.result_rank === undefined || raw.result_rank === null;
            
            const badges: string[] = [];
            if (raw?.is_getty === 1) badges.push('gt');
            if (raw?.is_trademark === 1) badges.push('tm');
            
            if (isUnknown) badges.push('unknown');
            else if (rank >= 0.8) badges.push('excellent');
            else if (rank >= 0.6) badges.push('good');
            else if (rank >= 0.4) badges.push('normal');
            else if (rank >= 0.2) badges.push('low');
            else badges.push('bad');
            
            return activeFilters.some(filter => badges.includes(filter));
        });
    }, [suggestedKeywords, activeFilters]);

    const handleCopyKeywords = () => {
        if (selectedKeywords.length === 0) return;
        navigator.clipboard.writeText(selectedKeywords.join(", "));
        toast.success("Keywords copied to clipboard!");
    };

    const handleExportTXT = () => {
        if (selectedKeywords.length === 0) return;
        const text = selectedKeywords.join(", ");
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keywords.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("TXT file downloaded!");
    };

    const handleExportCSV = () => {
        if (selectedKeywords.length === 0) return;
        const text = selectedKeywords.map(k => `"${k}"`).join(",");
        const blob = new Blob([text], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keywords.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("CSV file downloaded!");
    };

    const handleSelectTop = (num: number) => {
        // Select exactly the top 'num' keywords from filtered valid keywords
        const validKws = filteredKeywords.filter(k => k.raw?.is_trademark !== 1);
        const topKws = validKws.slice(0, num).map(k => k.keyword);
        
        validKws.forEach(kw => {
            const shouldBeSelected = topKws.includes(kw.keyword);
            const isSelected = selectedKeywords.includes(kw.keyword);
            
            if (shouldBeSelected !== isSelected) {
                onToggleKeyword(kw.keyword);
            }
        });
    };

    const handleSelectAll = () => {
        filteredKeywords.forEach(kw => {
            if (kw.raw?.is_trademark !== 1 && !selectedKeywords.includes(kw.keyword)) {
                onToggleKeyword(kw.keyword);
            }
        });
        setIsMenuOpen(false);
    };

    const handleDeselectAll = () => {
        onClearKeywords();
        setIsMenuOpen(false);
    };

    const handleInvertSelection = () => {
        filteredKeywords.forEach(kw => {
            if (kw.raw?.is_trademark !== 1) {
                onToggleKeyword(kw.keyword);
            }
        });
        setIsMenuOpen(false);
    };

    const getKeywordRankDot = (raw: any) => {
        if (!raw || raw.result_rank === undefined || raw.result_rank === null) return 'border-gray-300 dark:border-gray-600 bg-transparent border';
        const rank = parseFloat(raw.result_rank);
        if (rank >= 0.8) return 'bg-purple-500';
        if (rank >= 0.6) return 'bg-blue-500';
        if (rank >= 0.4) return 'bg-emerald-500';
        if (rank >= 0.2) return 'bg-yellow-400';
        return 'bg-gray-400';
    };

    const getFilterClass = (filterKey: string, baseClass: string) => {
        if (activeFilters.length === 0) return `${baseClass} cursor-pointer opacity-100 transition-all hover:scale-110`;
        return activeFilters.includes(filterKey) 
            ? `${baseClass} cursor-pointer ring-2 ring-offset-1 ring-offset-gray-50 dark:ring-offset-gray-800 ring-gray-400 dark:ring-gray-500 opacity-100 transition-all scale-110`
            : `${baseClass} cursor-pointer opacity-30 hover:opacity-60 transition-all`;
    };

    const toggleFilter = (filterKey: string) => {
        setActiveFilters(prev => 
            prev.includes(filterKey) 
                ? prev.filter(k => k !== filterKey) 
                : [...prev, filterKey]
        );
    };

    const renderFilterIcon = (filterKey: string) => {
        switch (filterKey) {
            case 'gt': return <div key={filterKey} className="flex items-center justify-center w-[16px] h-[16px] shrink-0 rounded-full bg-black text-white text-[8px] font-bold" title="Getty/iStock">gt</div>;
            case 'tm': return <div key={filterKey} className="flex items-center justify-center w-[16px] h-[16px] shrink-0 rounded-full bg-red-600 text-white text-[8px] font-bold" title="Trademark">TM</div>;
            case 'unknown': return <div key={filterKey} className="w-4 h-4 shrink-0 rounded-full border border-gray-300 dark:border-gray-500 bg-transparent" title="Not enough info"></div>;
            case 'bad': return <div key={filterKey} className="w-4 h-4 shrink-0 rounded-full bg-gray-400" title="Rank: Bad"></div>;
            case 'low': return <div key={filterKey} className="w-4 h-4 shrink-0 rounded-full bg-yellow-400" title="Rank: Low"></div>;
            case 'normal': return <div key={filterKey} className="w-4 h-4 shrink-0 rounded-full bg-emerald-500" title="Rank: Normal"></div>;
            case 'good': return <div key={filterKey} className="w-4 h-4 shrink-0 rounded-full bg-blue-500" title="Rank: Good"></div>;
            case 'excellent': return <div key={filterKey} className="w-4 h-4 shrink-0 rounded-full bg-purple-500" title="Rank: Excellent"></div>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Suggested Keywords Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col flex-1 overflow-hidden">
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 mb-4">
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Suggested keywords:</h3>
                        <span className="text-xs text-gray-500">{filteredKeywords.length} found</span>
                    </div>
                    
                    {/* Rank Legend / Filters */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm w-fit select-none">
                        <button onClick={() => toggleFilter('gt')} className={getFilterClass('gt', 'flex items-center justify-center w-[16px] h-[16px] shrink-0 rounded-full bg-black text-white text-[8px] font-bold')} title="Filter: Keywords used on Getty/iStock">gt</button>
                        <button onClick={() => toggleFilter('tm')} className={getFilterClass('tm', 'flex items-center justify-center w-[16px] h-[16px] shrink-0 rounded-full bg-red-600 text-white text-[8px] font-bold')} title="Filter: Trademark">TM</button>
                        <button onClick={() => toggleFilter('unknown')} className={getFilterClass('unknown', 'w-3.5 h-3.5 shrink-0 rounded-full border border-gray-300 dark:border-gray-500 bg-transparent ml-1')} title="Filter: Not enough info"></button>
                        <button onClick={() => toggleFilter('bad')} className={getFilterClass('bad', 'w-3.5 h-3.5 shrink-0 rounded-full bg-gray-400')} title="Filter: Rank Bad"></button>
                        <button onClick={() => toggleFilter('low')} className={getFilterClass('low', 'w-3.5 h-3.5 shrink-0 rounded-full bg-yellow-400')} title="Filter: Rank Low"></button>
                        <button onClick={() => toggleFilter('normal')} className={getFilterClass('normal', 'w-3.5 h-3.5 shrink-0 rounded-full bg-emerald-500')} title="Filter: Rank Normal"></button>
                        <button onClick={() => toggleFilter('good')} className={getFilterClass('good', 'w-3.5 h-3.5 shrink-0 rounded-full bg-blue-500')} title="Filter: Rank Good"></button>
                        <button onClick={() => toggleFilter('excellent')} className={getFilterClass('excellent', 'w-3.5 h-3.5 shrink-0 rounded-full bg-purple-500')} title="Filter: Rank Excellent"></button>
                        {activeFilters.length > 0 && (
                            <button onClick={() => setActiveFilters([])} className="ml-1 text-gray-400 hover:text-red-500 transition-colors" title="Clear filters">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {activeFilters.length === 0 && (
                            <span className="text-gray-500 dark:text-gray-400 text-[11px] ml-1 flex items-center whitespace-nowrap">→ Filter</span>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-3 content-start">
                    {suggestedKeywords.length === 0 ? (
                        <div className="text-sm text-gray-400 italic">Select works from the grid to see suggested keywords.</div>
                    ) : filteredKeywords.length === 0 ? (
                        <div className="text-[14px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex items-center gap-2 border border-gray-100 dark:border-gray-700 w-fit">
                            <span>No keywords are matched to filter:</span>
                            <div className="flex items-center gap-1.5 ml-1">
                                {activeFilters.map(renderFilterIcon)}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {filteredKeywords.map(({ keyword, count, raw }) => {
                                const isSelected = selectedKeywords.includes(keyword);
                                const isTrademark = raw?.is_trademark === 1;
                                
                                return (
                                    <button
                                        key={keyword}
                                        onClick={() => !isTrademark && onToggleKeyword(keyword)}
                                        disabled={isTrademark}
                                        className={`px-2 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors ${
                                            isTrademark 
                                                ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-400 dark:text-red-500/60 opacity-60 cursor-not-allowed'
                                                : isSelected 
                                                    ? 'bg-blue-500 border-blue-600 text-white shadow-sm' 
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                        }`}
                                        title={isTrademark ? "Trademark keywords cannot be selected for commercial use" : ""}
                                    >
                                        {raw?.is_getty === 1 && <span className={`flex items-center justify-center w-3.5 h-3.5 shrink-0 rounded-full ${isTrademark ? 'bg-gray-400' : 'bg-black'} text-white text-[7px] font-bold`} title="Used on Getty/iStock">gt</span>}
                                        {isTrademark && <span className="flex items-center justify-center w-3.5 h-3.5 shrink-0 rounded-full bg-red-600/70 text-white text-[7px] font-bold" title="Trademark">TM</span>}
                                        <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${isTrademark ? 'bg-red-200 dark:bg-red-900/40' : getKeywordRankDot(raw)}`} title={`Rank Score: ${raw?.result_rank || 'N/A'}`}></span>
                                        <span className={isTrademark ? 'line-through decoration-red-300/50' : ''}>{keyword}</span>
                                        <span className={`text-[10px] font-mono ${isTrademark ? 'text-red-300 dark:text-red-800' : isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                            ({count})
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {suggestedKeywords.length > 0 && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
                        <span className="text-xs text-gray-500">Select up to:</span>
                        
                        {/* Dynamic First Box */}
                        <button 
                            onClick={() => handleSelectTop(filteredKeywords.length)} 
                            className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium"
                            title={`Select all ${filteredKeywords.length} keywords`}
                        >
                            {filteredKeywords.length}
                        </button>
                        
                        {/* Fixed Options */}
                        {[10, 20, 30, 40, 49, 50].map(num => (
                            <button 
                                key={num}
                                onClick={() => handleSelectTop(num)} 
                                className="text-xs px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {num}
                            </button>
                        ))}
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-xs px-2.5 py-1 text-blue-600 dark:text-blue-400 rounded border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold tracking-widest transition-colors"
                            >
                                ...
                            </button>
                            
                            {isMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsMenuOpen(false)}
                                    ></div>
                                    <div className="absolute left-0 bottom-full mb-1 z-20 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                                        <button 
                                            onClick={handleSelectAll}
                                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            Select all
                                        </button>
                                        <button 
                                            onClick={handleDeselectAll}
                                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            Deselect all
                                        </button>
                                        <button 
                                            onClick={handleInvertSelection}
                                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            Invert selection
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Your Keywords Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Your keywords <span className="font-normal text-sm text-gray-500">({selectedKeywords.length})</span></h3>
                    <button 
                        onClick={onClearKeywords}
                        disabled={selectedKeywords.length === 0}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" /> Clear
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 min-h-[120px] content-start">
                    {selectedKeywords.length === 0 ? (
                        <div className="text-sm text-gray-400 italic">No keywords selected yet.</div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedKeywords.map(keyword => (
                                <span
                                    key={keyword}
                                    className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex items-center gap-1.5 text-gray-700 dark:text-gray-300 shadow-sm"
                                >
                                    {keyword}
                                    <button 
                                        onClick={() => onToggleKeyword(keyword)}
                                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <button 
                        onClick={handleCopyKeywords}
                        disabled={selectedKeywords.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-[3px] transition-colors disabled:opacity-50"
                    >
                        <Copy className="w-4 h-4" /> Copy to clipboard
                    </button>
                    <button 
                        onClick={handleExportTXT}
                        disabled={selectedKeywords.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-[3px] transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> Export TXT
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        disabled={selectedKeywords.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-[3px] transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
};
