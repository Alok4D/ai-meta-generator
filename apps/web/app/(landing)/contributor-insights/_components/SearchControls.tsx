"use client";

import React from "react";
import { Search, User, FileImage, Sparkles, Filter, ArrowUpDown, X, Layers, Image as ImageIcon } from "lucide-react";
import { SearchMode, FileTypeFilter, AiFilter, SortOption } from "./types";

interface SearchControlsProps {
    mode: SearchMode;
    onModeChange: (mode: SearchMode) => void;
    query: string;
    onQueryChange: (q: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    fileType: FileTypeFilter;
    onFileTypeChange: (type: FileTypeFilter) => void;
    aiContent: AiFilter;
    onAiContentChange: (ai: AiFilter) => void;
    sortBy: SortOption;
    onSortByChange: (sort: SortOption) => void;
    maxItems: number;
    onMaxItemsChange: (items: number) => void;
}

export default function SearchControls({
    mode,
    onModeChange,
    query,
    onQueryChange,
    onSubmit,
    isLoading,
    fileType,
    onFileTypeChange,
    aiContent,
    onAiContentChange,
    sortBy,
    onSortByChange,
    maxItems,
    onMaxItemsChange
}: SearchControlsProps) {

    const typeOptions: { id: FileTypeFilter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'photo', label: 'Photos' },
        { id: 'illustration', label: 'Illustrations' },
        { id: 'vector', label: 'Vectors' },
        { id: 'video', label: 'Videos' },
        { id: 'template', label: 'Templates' },
        { id: '3d', label: '3D' }
    ];

    const sortOptions: { id: SortOption; label: string; icon: string }[] = [
        { id: 'downloads', label: 'Most Downloaded', icon: '🔥' },
        { id: 'creation', label: 'Newest', icon: '⏱️' },
        { id: 'relevance', label: 'Top Relevant', icon: '📈' }
    ];

    return (
        <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Top Row: Mode Tabs & Per Page Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Tabs */}
                <div className="inline-flex p-1 bg-muted/60 border border-border/60 rounded-xl">
                    <button
                        type="button"
                        onClick={() => onModeChange('contributor')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'contributor'
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>Profile Tracker</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onModeChange('asset')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'asset'
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <FileImage className="w-3.5 h-3.5 text-indigo-500" />
                        <span>File ID Lookup</span>
                    </button>
                </div>

                {/* Quick Profile Assets Limit Selector */}
                {mode === 'contributor' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Fetch count:</span>
                        <select
                            value={maxItems}
                            onChange={(e) => onMaxItemsChange(Number(e.target.value))}
                            className="bg-muted/60 border border-border/60 rounded-lg px-2 py-1 text-xs text-foreground font-medium focus:outline-none"
                        >
                            <option value={14}>14 assets (Quick)</option>
                            <option value={30}>30 assets</option>
                            <option value={50}>50 assets</option>
                            <option value={100}>100 assets (Deep)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Search Input Box */}
            <form onSubmit={onSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder={
                            mode === 'contributor'
                                ? "Contributor ID (e.g. 213239991) or link (https://stock.adobe.com/contributor/...)"
                                : "Adobe Stock File ID (e.g. 2248162728) or asset link"
                        }
                        className="w-full pl-11 pr-10 py-3.5 bg-background border border-border/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-xs"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Scanning...</span>
                        </>
                    ) : (
                        <>
                            <span>Search</span>
                            <ArrowUpDown className="w-3.5 h-3.5 rotate-90" />
                        </>
                    )}
                </button>
            </form>

            {/* Sample Presets */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium">Quick Try:</span>
                {mode === 'contributor' ? (
                    <>
                        <button
                            type="button"
                            onClick={() => onQueryChange("https://stock.adobe.com/contributor/213239991/Line%20World")}
                            className="bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border border-border/50"
                        >
                            Line World (213239991)
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onQueryChange("2248162728")}
                            className="bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border border-border/50"
                        >
                            Trophy Cup (2248162728)
                        </button>
                        <button
                            type="button"
                            onClick={() => onQueryChange("2192893264")}
                            className="bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border border-border/50"
                        >
                            Microscope (2192893264)
                        </button>
                    </>
                )}
            </div>

            {/* Narrow filters bar */}
            {mode === 'contributor' && (
                <div className="pt-3 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Filter className="w-3 h-3 text-primary" />
                            Narrow Search Filters
                        </span>

                        {/* Sort options */}
                        <div className="flex items-center gap-1">
                            {sortOptions.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => onSortByChange(s.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                        sortBy === s.id
                                            ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                >
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content types & AI filter pills */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* File Types */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[11px] text-muted-foreground mr-1">Type:</span>
                            {typeOptions.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => onFileTypeChange(t.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                                        fileType === t.id
                                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* AI Content */}
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground mr-1">AI Content:</span>
                            {(['all', 'only', 'exclude'] as AiFilter[]).map((ai) => (
                                <button
                                    key={ai}
                                    type="button"
                                    onClick={() => onAiContentChange(ai)}
                                    className={`px-2 py-0.5 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                                        aiContent === ai
                                            ? "bg-indigo-600 text-white font-semibold shadow-xs"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                                    }`}
                                >
                                    {ai === 'all' ? 'All' : ai === 'only' ? 'AI Only' : 'No AI'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
