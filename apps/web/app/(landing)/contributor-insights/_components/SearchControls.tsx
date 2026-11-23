"use client";

import React from "react";
import { Search, User, FileImage, Filter, ArrowUpDown, X, Camera, Palette, PenTool, Video, Layout, Box, Sparkles } from "lucide-react";
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

    const typeOptions: { id: FileTypeFilter; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: null },
        { id: 'photo', label: 'Photos', icon: <Camera className="w-3.5 h-3.5" /> },
        { id: 'vector', label: 'Vectors', icon: <PenTool className="w-3.5 h-3.5" /> },
        { id: 'illustration', label: 'Illustrations', icon: <Palette className="w-3.5 h-3.5" /> },
        { id: 'video', label: 'Videos', icon: <Video className="w-3.5 h-3.5" /> },
        { id: 'template', label: 'Templates', icon: <Layout className="w-3.5 h-3.5" /> },
        { id: '3d', label: '3D', icon: <Box className="w-3.5 h-3.5" /> }
    ];

    const sortOptions: { id: SortOption; label: string }[] = [
        { id: 'downloads', label: 'Most Downloaded' },
        { id: 'creation', label: 'Newest' },
        { id: 'relevance', label: 'Top Relevant' }
    ];

    return (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Top Row: Mode Tabs & Fetch Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Adobe Segmented Mode Switcher */}
                <div className="inline-flex p-1 bg-muted/60 border border-border/60 rounded-full">
                    <button
                        type="button"
                        onClick={() => onModeChange('contributor')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'contributor'
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <User className="w-3.5 h-3.5 text-[#1473E6]" />
                        <span>Contributor Profile</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onModeChange('asset')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'asset'
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <FileImage className="w-3.5 h-3.5 text-[#EB1000]" />
                        <span>File ID Lookup</span>
                    </button>
                </div>

                {/* Quick Profile Assets Limit Selector */}
                {mode === 'contributor' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-auto">
                        <span className="font-medium">Assets limit:</span>
                        <select
                            value={maxItems}
                            onChange={(e) => onMaxItemsChange(Number(e.target.value))}
                            className="bg-muted/60 border border-border/60 rounded-full px-3 py-1 text-xs text-foreground font-semibold focus:outline-none focus:border-[#1473E6] cursor-pointer"
                        >
                            <option value={14}>14 assets (Adobe page 1)</option>
                            <option value={30}>30 assets</option>
                            <option value={50}>50 assets</option>
                            <option value={100}>100 assets (Full batch)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Adobe Stock Signature Rounded Search Bar */}
            <form onSubmit={onSubmit} className="relative flex items-center gap-3">
                <div className="relative flex-1 group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#1473E6] transition-colors">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder={
                            mode === 'contributor'
                                ? "Enter Contributor ID (e.g. 213239991) or URL (https://stock.adobe.com/contributor/...)"
                                : "Enter Adobe Stock File ID (e.g. 2248162728) or asset link"
                        }
                        className="w-full pl-12 pr-11 py-3.5 bg-background border border-border/80 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#1473E6] focus:ring-3 focus:ring-[#1473E6]/20 transition-all shadow-xs"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Adobe Blue Search Button */}
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="h-12 px-7 bg-[#1473E6] hover:bg-[#0d66d0] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#1473E6]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Scanning...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </>
                    )}
                </button>
            </form>

            {/* Quick Presets Line */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap pt-0.5">
                <span className="font-semibold text-foreground/80">Demo Search:</span>
                {mode === 'contributor' ? (
                    <button
                        type="button"
                        onClick={() => onQueryChange("https://stock.adobe.com/contributor/213239991/Line%20World")}
                        className="bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border border-border/60 hover:border-[#1473E6]/50"
                    >
                        Line World (213239991)
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onQueryChange("2248162728")}
                            className="bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer border border-border/60 hover:border-[#1473E6]/50"
                        >
                            Trophy Cup (#2248162728)
                        </button>
                        <button
                            type="button"
                            onClick={() => onQueryChange("2192893264")}
                            className="bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer border border-border/60 hover:border-[#1473E6]/50"
                        >
                            Microscope (#2192893264)
                        </button>
                    </>
                )}
            </div>

            {/* Adobe Stock Filters Bar (Pills style) */}
            {mode === 'contributor' && (
                <div className="pt-4 border-t border-border/60 space-y-3.5">
                    {/* Sort Selector Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Filter className="w-3.5 h-3.5 text-[#1473E6]" />
                            <span>Filters & Sort</span>
                        </div>

                        {/* Sort options (Segmented pills) */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-muted-foreground mr-1">Sort:</span>
                            {sortOptions.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => onSortByChange(s.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        sortBy === s.id
                                            ? "bg-[#1473E6] text-white shadow-xs font-semibold"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Types & AI Filter (Adobe Pill Bars) */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* File Types Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-muted-foreground mr-1">Category:</span>
                            {typeOptions.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => onFileTypeChange(t.id)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                                        fileType === t.id
                                            ? "bg-[#1473E6] text-white font-bold shadow-xs border border-[#1473E6]"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 hover:border-border"
                                    }`}
                                >
                                    {t.icon}
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* AI Content Pills */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground mr-1">AI:</span>
                            {(['all', 'only', 'exclude'] as AiFilter[]).map((ai) => (
                                <button
                                    key={ai}
                                    type="button"
                                    onClick={() => onAiContentChange(ai)}
                                    className={`px-2.5 py-1 rounded-full text-xs capitalize transition-all cursor-pointer ${
                                        aiContent === ai
                                            ? "bg-purple-600 text-white font-bold shadow-xs"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
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
