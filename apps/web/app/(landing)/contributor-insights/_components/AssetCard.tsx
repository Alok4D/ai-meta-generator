"use client";

import React from "react";
import { Flame, Calendar } from "lucide-react";
import { AdobeAssetItem } from "./types";

interface AssetCardProps {
    asset: AdobeAssetItem;
    onSelect: (asset: AdobeAssetItem) => void;
}

const ADOBE_FONT_FAMILY =
    'adobe-clean, "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Trebuchet MS", "Lucida Grande", sans-serif';

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
                                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#42a5f5]/10 text-[#1473E6] border border-[#42a5f5]/30 flex items-center gap-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-3 h-3 shrink-0"
                                        aria-hidden="true"
                                    >
                                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                                    </svg>
                                    <span>AI</span>
                                </span>
                            )}
                        </div>

                        <span
                            style={{
                                fontFamily: ADOBE_FONT_FAMILY,
                                fontSize: "24px",
                                fontWeight: 300,
                                lineHeight: "36px",
                                letterSpacing: "2.4px"
                            }}
                            className="px-3 py-0.5 rounded-none bg-[#42a5f5] text-white flex items-center gap-1.5 shrink-0"
                        >
                            <Flame className="w-4 h-4 fill-white text-white shrink-0" />
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
                        <span
                            style={{
                                fontFamily: ADOBE_FONT_FAMILY,
                                fontWeight: 400,
                                letterSpacing: "0.4px"
                            }}
                            className="flex items-center gap-1 shrink-0 text-[12px] text-[#4b4b4b] dark:text-muted-foreground"
                        >
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
