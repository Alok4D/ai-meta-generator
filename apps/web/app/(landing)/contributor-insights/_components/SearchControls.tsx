"use client";

import React, { useState } from "react";
import {
    Search,
    User,
    FileImage,
    X,
    Settings,
    Camera
} from "lucide-react";
import { SearchMode, FileTypeFilter, AiFilter, SortOption, ApifyKeyRecord } from "./types";
import CategoryDropdown from "./CategoryDropdown";
import FindSimilarModal from "./FindSimilarModal";

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
    onOpenSettings: () => void;
    selectedKey: ApifyKeyRecord | null;
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
    onOpenSettings,
    selectedKey
}: SearchControlsProps) {
    const [isFindSimilarOpen, setIsFindSimilarOpen] = useState(false);



    const handleFileSelected = (file: File) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const idMatch = cleanName.match(/\b\d{6,15}\b/);
        if (idMatch) {
            onQueryChange(idMatch[0]);
            onModeChange("asset");
        } else {
            const terms = cleanName
                .replace(/[_-]+/g, " ")
                .replace(/\b(preview|stock|adobe|vector|image|illustration|art)\b/gi, "")
                .trim();
            onQueryChange(terms || cleanName);
        }
    };

    return (
        <div className="space-y-3">
            {/* Main Search Row: Unified Input Bar + Search Button (rounded-none) + External Gear Icon */}
            <form onSubmit={onSubmit} className="flex items-center gap-2">
                {/* Search Bar Input Container (Clean, no extra shadow, minimal rounded-[2px] / flat) */}
                <div className="flex-1 flex items-stretch bg-card border border-border/80 focus-within:border-[#1473E6] rounded-none transition-colors h-11">
                    {/* Category Dropdown (All v) */}
                    <CategoryDropdown
                        fileType={fileType}
                        onFileTypeChange={onFileTypeChange}
                    />

                    {/* Search Field */}
                    <div className="flex-1 flex items-center min-w-0 px-3 gap-2">
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder={
                                mode === "contributor"
                                    ? "Search Contributor ID (e.g. 213239991) or profile link..."
                                    : "Search Adobe Stock File ID (e.g. 2248162728) or asset link..."
                            }
                            className="w-full bg-transparent border-0 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 rounded-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => onQueryChange("")}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                                title="Clear"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Find Similar Icon Button (Inside Right of Input) */}
                    <div className="flex items-center pr-2.5">
                        <button
                            type="button"
                            onClick={() => setIsFindSimilarOpen(true)}
                            title="Find similar: Drag & drop an image or audio file"
                            className="p-1.5 text-muted-foreground hover:text-[#1473E6] transition-colors cursor-pointer rounded-none"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search Submit Button (rounded-none, sharp Adobe Blue) */}
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="h-11 px-6 bg-[#1473E6] hover:bg-[#0d66d0] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-none shrink-0"
                >
                    {isLoading ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Scanning...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-3.5 h-3.5" />
                            <span>Search</span>
                        </>
                    )}
                </button>

                {/* External Gear Icon (Placed after Search button, clean icon only) */}
                <button
                    type="button"
                    onClick={onOpenSettings}
                    title={
                        selectedKey
                            ? `Apify Settings: ${selectedKey.username ? "@" + selectedKey.username : selectedKey.label} (Connected)`
                            : "Apify API Settings"
                    }
                    className="relative h-11 w-11 flex items-center justify-center bg-card hover:bg-muted/70 border border-border/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-none shrink-0"
                >
                    <Settings className="w-4 h-4 hover:rotate-45 transition-transform duration-300" />
                    {selectedKey && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                </button>
            </form>

            {/* Sub-bar: Modes, Presets, Sort, AI & Assets Limit (Clean, rounded-none / rounded-[2px], no heavy shadows) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs pt-0.5">
                {/* Left Side: Mode Switcher & Presets */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Mode Switcher */}
                    <div className="inline-flex border border-border/80 rounded-none bg-card">
                        <button
                            type="button"
                            onClick={() => onModeChange("contributor")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs transition-colors cursor-pointer rounded-none ${
                                mode === "contributor"
                                    ? "bg-[#1473E6] text-white font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
                            }`}
                        >
                            <User className={`w-3.5 h-3.5 ${mode === "contributor" ? "text-white" : "text-[#1473E6]"}`} />
                            <span>Contributor</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onModeChange("asset")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs transition-colors cursor-pointer rounded-none border-l border-border/80 ${
                                mode === "asset"
                                    ? "bg-[#1473E6] text-white font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
                            }`}
                        >
                            <FileImage className={`w-3.5 h-3.5 ${mode === "asset" ? "text-white" : "text-[#EB1000]"}`} />
                            <span>Asset Lookup</span>
                        </button>
                    </div>

                    {/* Demo Presets */}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="text-[11px]">Demo:</span>
                        {mode === "contributor" ? (
                            <>
                              
                                <button
                                    type="button"
                                    onClick={() => onQueryChange("https://stock.adobe.com/contributor/210274732/sense")}
                                    className="bg-muted/40 hover:bg-muted text-foreground px-2 py-0.5 text-[11px] transition-colors cursor-pointer border border-border/60 rounded-none"
                                >
                                    sense
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onQueryChange("2192893264")}
                                    className="bg-muted/40 hover:bg-muted text-foreground px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer border border-border/60 rounded-none"
                                >
                                    Microscope (#2192893264)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onQueryChange("2248162728")}
                                    className="bg-muted/40 hover:bg-muted text-foreground px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer border border-border/60 rounded-none"
                                >
                                    Trophy Cup (#2248162728)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Find Similar Modal */}
            <FindSimilarModal
                isOpen={isFindSimilarOpen}
                onClose={() => setIsFindSimilarOpen(false)}
                onFileSelect={handleFileSelected}
            />
        </div>
    );
}
