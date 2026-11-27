"use client";

import React from "react";
import { Flame, Sparkles, Calendar } from "lucide-react";
import { AdobeAssetItem } from "./types";

interface AssetCardProps {
    asset: AdobeAssetItem;
    onSelect: (asset: AdobeAssetItem) => void;
}

export default function AssetCard({ asset, onSelect }: AssetCardProps) {
    return (
        <div
            onClick={() => onSelect(asset)}
            className="group relative bg-card border border-border/80 hover:border-[#1473E6]/60 rounded-none overflow-hidden transition-all duration-200 flex flex-col cursor-pointer"
        >
            {/* Clean Image Preview Container (No overlays on image) */}
            <div className="relative aspect-video w-full bg-muted/40 border-b border-border/60 overflow-hidden flex items-center justify-center">
                {asset.thumbnailUrl ? (
                    <img
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center text-muted-foreground text-xs">
                        No Preview
                    </div>
                )}
            </div>

            {/* Asset Info Card Body */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-2">
                    {/* Media Type, AI Badge & Downloads Row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-muted text-foreground border border-border/80">
                                {asset.mediaType}
                            </span>
                            {asset.isGenerativeAi && (
                                <span className="px-1.5 py-0.5 rounded-none text-[10px] font-bold bg-purple-600/90 text-white flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> AI
                                </span>
                            )}
                        </div>

                        <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1 shrink-0">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            <span>{asset.downloads} DL</span>
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-[#1473E6] transition-colors" title={asset.title}>
                        {asset.title}
                    </h3>
                </div>

                {/* Card Footer: Category & Full Upload Date */}
                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground gap-2">
                    <span className="truncate max-w-[140px]">
                        {asset.categoryName || "General"}
                    </span>

                    {asset.createdAt && (
                        <span className="flex items-center gap-1 shrink-0 font-medium">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>
                                {new Date(asset.createdAt).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
