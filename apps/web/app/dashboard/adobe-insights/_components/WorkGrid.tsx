import React, { useState, useRef } from 'react';
import { Check, CheckSquare, Square, X, ExternalLink, Copy, Download } from 'lucide-react';
import Swal from 'sweetalert2';

interface WorkGridProps {
    works: any[];
    selectedWorkIds: number[];
    onToggleWork: (id: number) => void;
    onSelectAll?: () => void;
    onSelectNone?: () => void;
    layoutMode: 'list' | 'grid' | 'half';
    onLayoutChange: (mode: 'list' | 'grid' | 'half') => void;
}

export const WorkGrid: React.FC<WorkGridProps> = ({
    works,
    selectedWorkIds,
    onToggleWork,
    onSelectAll,
    onSelectNone,
    layoutMode,
    onLayoutChange
}) => {
    const [hoveredInfoId, setHoveredInfoId] = useState<number | null>(null);
    const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
    const [keywordTooltip, setKeywordTooltip] = useState<{kw: any, x: number, y: number} | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (id: number, e: React.MouseEvent) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        const rect = e.currentTarget.getBoundingClientRect();
        // Default to aligning right edge of popover with right edge of icon
        let x = rect.right - 850;
        // If it goes off-screen to the left, align left edge instead
        if (x < 10) x = rect.left;
        
        // Default to opening downwards
        let y = rect.bottom + 8;
        // If it goes off-screen at the bottom, open upwards
        if (typeof window !== 'undefined' && y + 500 > window.innerHeight) {
            y = rect.top - 500 - 8;
        }
        
        setPopoverPos({ x, y });
        setHoveredInfoId(id);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setHoveredInfoId(null);
        }, 300); // 300ms delay allows user to move mouse to the popup
    };

    const handleDownload = (format: 'txt' | 'csv', item: any) => {
        if (!item.keywords) return;
        const text = item.keywords.map((k: any) => k.title_keyword).join(format === 'csv' ? ',' : ', ');
        const blob = new Blob([text], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keywords_${item.id_work}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Copied successfully",
            showConfirmButton: false,
            timer: 1500,
            backdrop: false
        });
    };

    if (!works || works.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8 bg-white dark:bg-gray-900/50 rounded-md border border-gray-100 dark:border-gray-800/60 m-2 shadow-sm">
                <img 
                    src="/gradient-career-cushioning-illustration_52683-140257.avif" 
                    alt="Start Searching" 
                    className="w-80 h-80 md:w-[450px] md:h-[450px] object-contain mb-8 drop-shadow-sm hover:scale-105 transition-transform duration-500"
                />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                    Discover Premium Stock Insights
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-[450px] text-base leading-relaxed">
                    Search for trending works, analyze top-performing images, and extract highly optimized keywords for your own portfolio.
                </p>
            </div>
        );
    }

    const allSelected = works.length > 0 && selectedWorkIds.length === works.length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedWorkIds.length}</span> 
                    works selected
                </div>
                
                <div className="flex items-center text-xs text-gray-500 font-medium">
                    <span className="mr-2">Interface layout:</span>
                    <div className="flex bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-[2px]">
                        <button 
                            onClick={() => onLayoutChange('list')}
                            className={`p-1 rounded-sm transition-colors ${layoutMode === 'list' ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title="List view"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                        <button 
                            onClick={() => onLayoutChange('grid')}
                            className={`p-1 rounded-sm transition-colors ${layoutMode === 'grid' ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title="Grid view"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                        <button 
                            onClick={() => onLayoutChange('half')}
                            className={`px-1.5 py-0.5 rounded-sm transition-colors flex items-center justify-center font-bold text-[10px] h-[22px] ${layoutMode === 'half' ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title="Split view"
                        >
                            1/2
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={onSelectAll}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Select All
                    </button>
                    <button 
                        onClick={onSelectNone}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Deselect All
                    </button>
                </div>
            </div>

            <div className={`grid gap-2 ${layoutMode === 'list' ? 'grid-cols-1' : layoutMode === 'half' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {works.map((item: any) => {
                    const isSelected = selectedWorkIds.includes(item.id_work);
                    const imgSrc = item.small_preview_link_work || item.big_preview_link_work || item.thumbnail || item.preview;

                    return (
                        <div 
                            key={item.id_work}
                            className={`group relative cursor-pointer border-2 transition-all ${layoutMode === 'list' ? 'flex flex-row h-48 bg-[#eaeaea] dark:bg-gray-800' : 'flex flex-col aspect-[4/3] bg-[#eaeaea] dark:bg-gray-800'} ${isSelected ? 'border-[#ffe169]' : 'border-transparent'}`}
                        >
                            {/* Image Container */}
                            <div 
                                className={`relative overflow-hidden ${layoutMode === 'list' ? 'w-64 h-full shrink-0' : 'w-full h-full flex-1'}`}
                                onClick={() => onToggleWork(item.id_work)}
                            >
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={item.title_work || "Artwork"}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center">
                                        <span className="mb-2">No Preview</span>
                                    </div>
                                )}

                                {/* Selected Border Overlay */}
                                {isSelected && (
                                    <div className="absolute inset-0 border-[4px] border-[#ffe169] pointer-events-none z-10"></div>
                                )}

                            {/* Info Icon with Popover (Top Right) */}
                            <div 
                                className="absolute top-2 right-2 z-50 flex flex-col items-end"
                                onMouseEnter={(e) => handleMouseEnter(item.id_work, e)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className={`w-6 h-6 rounded-full bg-[#dce3de]/90 flex items-center justify-center text-gray-700 font-serif italic text-sm transition-opacity duration-150 shadow-sm cursor-help ${isSelected || hoveredInfoId === item.id_work ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    i
                                </div>

                                {/* Detailed Popover */}
                                {hoveredInfoId === item.id_work && (
                                    <div 
                                        className="fixed w-[850px] h-[500px] bg-[#f8f9fa] dark:bg-gray-800 shadow-2xl rounded-md border border-gray-200 dark:border-gray-700 flex cursor-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[9999]"
                                        style={{ left: popoverPos.x, top: popoverPos.y }}
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        {/* Left Side: Image Preview */}
                                        <div className="w-1/2 bg-[#eaeaea] dark:bg-gray-900 flex items-center justify-center p-4">
                                            {imgSrc ? (
                                                <img src={item.big_preview_link_work || imgSrc} className="max-w-full max-h-full object-contain drop-shadow-md" alt="Preview" />
                                            ) : (
                                                <span className="text-gray-400">No Preview</span>
                                            )}
                                        </div>

                                        {/* Right Side: Details */}
                                        <div className="w-1/2 p-6 flex flex-col h-full bg-[#f8f9fa] dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Title:</span>
                                                <div className="flex items-center gap-3 text-[13px] text-gray-600 dark:text-gray-300">
                                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => onToggleWork(item.id_work)}
                                                            className="cursor-pointer w-3.5 h-3.5"
                                                        />
                                                        Select work
                                                    </label>
                                                    <a href={item.link_work} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                                        <ExternalLink className="w-3 h-3" /> Link
                                                    </a>
                                                    <button onClick={() => setHoveredInfoId(null)} className="hover:text-red-500 transition-colors ml-1">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <div className="relative group/title mb-4">
                                                <p className="text-[14px] text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed pr-6">
                                                    {item.title_work || "No title provided"}
                                                </p>
                                                <button 
                                                    onClick={() => handleCopy(item.title_work)}
                                                    className="absolute right-0 top-0 opacity-100 text-gray-400 hover:text-gray-700 transition-all"
                                                    title="Copy title"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Keywords */}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Keywords:</span>
                                                {item.keywords && (
                                                    <button 
                                                        onClick={() => {
                                                            const text = item.keywords.map((k: any) => k.title_keyword).join(', ');
                                                            handleCopy(text);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-700 transition-colors"
                                                        title="Copy all keywords"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 relative">
                                                <div className="flex flex-wrap items-center gap-x-1 gap-y-2 pb-2">
                                                    {item.keywords && Array.isArray(item.keywords) && item.keywords.map((kw: any, idx: number) => {
                                                        const themes = [
                                                            { bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
                                                            { bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800', dot: 'bg-red-400' },
                                                            { bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
                                                            { bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
                                                            { bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
                                                        ];
                                                        const theme = themes[idx % themes.length] || themes[0];
                                                        
                                                        return (
                                                            <React.Fragment key={idx}>
                                                                <span 
                                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[13px] border text-gray-700 dark:text-gray-200 shadow-sm cursor-help transition-transform hover:scale-105 ${theme?.bg || themes[0]?.bg || ''}`}
                                                                    onMouseEnter={(e) => setKeywordTooltip({ kw, x: e.clientX, y: e.clientY })}
                                                                    onMouseLeave={() => setKeywordTooltip(null)}
                                                                    onMouseMove={(e) => setKeywordTooltip({ kw, x: e.clientX, y: e.clientY })}
                                                                >
                                                                    <span className={`w-2 h-2 rounded-full ${theme?.dot || themes[0]?.dot || ''}`}></span>
                                                                    {kw.title_keyword}
                                                                    {kw.is_trademark === 1 && <span className="text-[10px] text-red-500 font-bold ml-0.5" title="Trademark">™</span>}
                                                                </span>
                                                                <span className="text-gray-500 font-serif mr-1">,</span>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            
                                            {/* Keyword Count Footer */}
                                            {item.keywords && (
                                                <div className="flex justify-between items-center text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex gap-3">
                                                        <span className="uppercase tracking-wider font-medium">Download:</span>
                                                        <button onClick={() => handleDownload('txt', item)} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                                                            <Download className="w-3 h-3" /> TXT
                                                        </button>
                                                        <button onClick={() => handleDownload('csv', item)} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                                                            <Download className="w-3 h-3" /> CSV
                                                        </button>
                                                    </div>
                                                    <div>
                                                        {item.keywords.length} / {item.keywords.length}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                            {/* Metadata Area for List mode */}
                            {layoutMode === 'list' && (
                                <div className="flex flex-col p-3 flex-1 overflow-y-auto custom-scrollbar border-l border-white/50 dark:border-gray-700">
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                                        {item.title_work || "No title provided"}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pb-2">
                                        {item.keywords?.map((kw: any, idx: number) => (
                                            <span 
                                                key={idx}
                                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[11px] border border-gray-200 dark:border-gray-600 truncate max-w-full"
                                            >
                                                {kw.title_keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Overlay Bottom Strip */}
                            <div className={`absolute bottom-0 left-0 w-full h-10 bg-[#dce3de]/90 flex items-center px-3 transition-opacity duration-150 z-20 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {/* Checkbox */}
                                <div className="w-4 h-4 border border-gray-600 bg-transparent flex items-center justify-center mr-2 shrink-0 rounded-sm">
                                    {isSelected && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3 text-black">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[#294859] text-[15px]">Select work</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Global Keyword Tooltip */}
            {keywordTooltip && (
                <div 
                    className="fixed z-[100000] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-none transform -translate-x-1/2 -translate-y-full min-w-[220px]"
                    style={{ left: keywordTooltip.x, top: keywordTooltip.y - 14 }}
                >
                    <div className="font-semibold text-sm mb-3 pb-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="capitalize text-gray-900 dark:text-white">{keywordTooltip.kw.title_keyword}</span>
                        {keywordTooltip.kw.spellcheck_status === 1 && <span title="Spellchecked"><Check className="w-4 h-4 text-emerald-500" /></span>}
                    </div>
                    
                    <div className="flex flex-col gap-2.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
                            <span className={`font-medium ${parseFloat(keywordTooltip.kw.downloads_rank) > 0.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {keywordTooltip.kw.downloads_rank || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">Competition:</span>
                            <span className={`font-medium ${parseFloat(keywordTooltip.kw.competition_rank) > 0.8 ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {keywordTooltip.kw.competition_rank || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">Views Rank:</span>
                            <span className="font-medium">{keywordTooltip.kw.views_rank || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">Trend Score:</span>
                            <span className={`font-medium ${parseFloat(keywordTooltip.kw.trend_rank) > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {keywordTooltip.kw.trend_rank || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-gray-500 dark:text-gray-400">Overall Rank:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-[13px]">
                                {keywordTooltip.kw.result_rank || 'N/A'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-white dark:border-t-gray-800 drop-shadow-sm"></div>
                </div>
            )}
        </div>
    );
};
