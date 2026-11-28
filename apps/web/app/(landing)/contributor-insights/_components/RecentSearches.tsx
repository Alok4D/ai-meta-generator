"use client";

import { History, User, FileImage, X, Trash2 } from "lucide-react";
import { RecentSearchEntry } from "../_lib/search-cache";

interface RecentSearchesProps {
    items: RecentSearchEntry[];
    isLoading: boolean;
    onSelect: (entry: RecentSearchEntry) => void;
    onRemove: (id: string) => void;
    onClearAll: () => void;
}

export default function RecentSearches({
    items,
    isLoading,
    onSelect,
    onRemove,
    onClearAll
}: RecentSearchesProps) {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mr-1">
                <History className="w-3.5 h-3.5" />
                <span>Recent Searches:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {items.map((entry) => (
                    <div
                        key={entry.id}
                        className="group inline-flex items-center border border-border/80 bg-card hover:border-[#1473E6]/60 hover:bg-muted/40 transition-colors rounded-none text-xs"
                    >
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => onSelect(entry)}
                            title={`${entry.mode === "contributor" ? "Contributor" : "Asset"}: ${entry.query}`}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {entry.mode === "contributor" ? (
                                <User className="w-3 h-3 text-[#1473E6] shrink-0" />
                            ) : (
                                <FileImage className="w-3 h-3 text-[#EB1000] shrink-0" />
                            )}
                            <span className="max-w-[160px] truncate font-medium">
                                {entry.displayLabel}
                            </span>
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(entry.id);
                            }}
                            title="Remove from recent searches"
                            className="pr-1.5 pl-0.5 py-1 text-muted-foreground/70 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {items.length > 1 && (
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                </button>
            )}
        </div>
    );
}
