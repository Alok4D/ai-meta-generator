"use client";

import React from "react";
import { Eye, Flame, Maximize2, Tag, Layers, Sparkles } from "lucide-react";
import { AdobeAssetItem } from "./types";

interface AssetCardProps {
    asset: AdobeAssetItem;
    onSelect: (asset: AdobeAssetItem) => void;
}

export default function AssetCard({ asset, onSelect }: AssetCardProps) {
    const getDemandBadge = () => {
        if (asset.demandTone === 'top') {
            return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
        }
        if (asset.demandTone === 'strong') {
            return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
        }
        if (asset.demandTone === 'low') {
            return "bg-muted text-muted-foreground border-border/40";
        }
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    };

    return (
        <div
            onClick={() => onSelect(asset)}
            className="group relative bg-card border border-border/70 hover:border-primary/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
        >
            {/* Image Preview Container */}
            <div className="relative aspect-video w-full bg-muted/40 overflow-hidden flex items-center justify-center">
                {asset.thumbnailUrl ? (
                    <img
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center text-muted-foreground text-xs">
                        No Preview
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Inspect Details & Keywords
                    </span>
                </div>

                {/* Top Left Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/10">
                        {asset.mediaType}
                    </span>
                    {asset.isGenerativeAi && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-md flex items-center gap-0.5 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                    )}
                </div>

                {/* Top Right Downloads Badge */}
                <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/75 text-amber-400 backdrop-blur-md border border-amber-400/30 flex items-center gap-1 shadow-md">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{asset.downloads} DL</span>
                    </span>
                </div>
            </div>

            {/* Asset Info Card Body */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                    {/* Demand badge & Category */}
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDemandBadge()}`}>
                            {asset.demandTag || "Asset"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                            {asset.categoryName || "General"}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors" title={asset.title}>
                        {asset.title}
                    </h3>
                </div>

                {/* Card Footer: Keywords count & Date */}
                <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                        <Tag className="w-3 h-3 text-primary" />
                        <span>{asset.keywords.length} keywords</span>
                    </span>

                    {asset.createdAt && (
                        <span>
                            {new Date(asset.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
