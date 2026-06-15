import React, { useMemo, useState } from 'react';
import { X, Copy, Trash2, Edit } from 'lucide-react';
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

    // Aggregate keywords from selected works
    const suggestedKeywords = useMemo(() => {
        if (selectedWorks.length === 0) return [];

        const counts: Record<string, number> = {};
        
        selectedWorks.forEach(work => {
            if (work.keywords && Array.isArray(work.keywords)) {
                work.keywords.forEach((kw: any) => {
                    const title = kw.title_keyword.toLowerCase();
                    counts[title] = (counts[title] || 0) + 1;
                });
            }
        });

        // Convert to array, sort by count (descending), then alphabetically
        return Object.entries(counts)
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.keyword.localeCompare(b.keyword);
            });
    }, [selectedWorks]);

    const handleCopyKeywords = () => {
        if (selectedKeywords.length === 0) return;
        navigator.clipboard.writeText(selectedKeywords.join(", "));
        toast.success("Keywords copied to clipboard!");
    };

    const handleSelectTop = (num: number) => {
        // Select the top 'num' keywords from suggested that aren't already selected
        const topKws = suggestedKeywords.slice(0, num).map(k => k.keyword);
        topKws.forEach(kw => {
            if (!selectedKeywords.includes(kw)) {
                onToggleKeyword(kw);
            }
        });
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Suggested Keywords Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Suggested keywords:</h3>
                    <div className="text-xs text-gray-500">{suggestedKeywords.length} found</div>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-3 content-start">
                    {suggestedKeywords.length === 0 ? (
                        <div className="text-sm text-gray-400 italic">Select works from the grid to see suggested keywords.</div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {suggestedKeywords.map(({ keyword, count }) => {
                                const isSelected = selectedKeywords.includes(keyword);
                                return (
                                    <button
                                        key={keyword}
                                        onClick={() => onToggleKeyword(keyword)}
                                        className={`px-2 py-1 text-xs rounded-md border flex items-center gap-1 transition-colors ${
                                            isSelected 
                                                ? 'bg-blue-500 border-blue-600 text-white shadow-sm' 
                                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                        }`}
                                    >
                                        <span>{keyword}</span>
                                        <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
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
                        <button onClick={() => handleSelectTop(10)} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50">10</button>
                        <button onClick={() => handleSelectTop(25)} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50">25</button>
                        <button onClick={() => handleSelectTop(50)} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50">50</button>
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Copy className="w-4 h-4" /> Copy to clipboard
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description:</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Title:</label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
