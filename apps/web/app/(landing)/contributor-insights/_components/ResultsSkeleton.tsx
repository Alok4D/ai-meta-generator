"use client";

import React from "react";
import { SearchMode } from "./types";

interface ResultsSkeletonProps {
    mode: SearchMode;
}

function AssetCardSkeleton() {
    return (
        <div className="bg-card border border-border/80 rounded-none overflow-hidden flex flex-col animate-pulse">
            {/* Image Preview Skeleton */}
            <div className="aspect-video w-full bg-muted/60 border-b border-border/60" />

            {/* Card Body Skeleton */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-2.5">
                    {/* Media Type & Download Badge Row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="h-5 w-16 bg-muted/80 rounded-none" />
                            <div className="h-5 w-10 bg-muted/60 rounded-none" />
                        </div>
                        <div className="h-9 w-24 bg-[#42a5f5]/25 rounded-none" />
                    </div>

                    {/* Title Skeleton (2 lines) */}
                    <div className="space-y-1.5 pt-0.5">
                        <div className="h-3.5 w-full bg-muted/70 rounded-none" />
                        <div className="h-3.5 w-4/5 bg-muted/60 rounded-none" />
                    </div>
                </div>

                {/* Footer Skeleton: Category & Date */}
                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="h-3 w-24 bg-muted/60 rounded-none" />
                    <div className="h-3 w-20 bg-muted/60 rounded-none" />
                </div>
            </div>
        </div>
    );
}

export default function ResultsSkeleton({ mode }: ResultsSkeletonProps) {
    const cardCount = mode === "asset" ? 1 : 8;

    return (
        <div className="space-y-6">
            {/* Contributor Summary Card Skeleton */}
            {mode === "contributor" && (
                <div className="bg-card border border-border/80 rounded-none p-5 sm:p-6 animate-pulse">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left Identity Skeleton */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-40 bg-[#1473E6]/15 rounded-none" />
                                <div className="h-4 w-20 bg-muted/70 rounded-none" />
                            </div>
                            <div className="h-8 w-44 bg-muted/80 rounded-none" />
                            <div className="flex items-center gap-3 pt-0.5">
                                <div className="h-3.5 w-32 bg-muted/60 rounded-none" />
                                <div className="h-3.5 w-16 bg-muted/60 rounded-none" />
                                <div className="h-3.5 w-28 bg-muted/60 rounded-none" />
                            </div>
                        </div>

                        {/* Right Stat Widgets Skeleton */}
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="bg-muted/30 border border-border/80 rounded-none p-3 min-w-[95px] flex flex-col items-center gap-2"
                                >
                                    <div className="h-3 w-16 bg-muted/70 rounded-none" />
                                    <div className="h-6 w-12 bg-muted/80 rounded-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Date Range Banner Skeleton */}
            {mode === "contributor" && (
                <div className="bg-card border border-border/80 rounded-none p-3.5 sm:px-5 animate-pulse">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="h-4 w-24 bg-muted/70 rounded-none" />
                            <div className="h-8 w-[420px] max-w-full bg-muted/50 border border-border/60 rounded-none" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-32 bg-muted/50 border border-border/60 rounded-none" />
                            <div className="h-4 w-24 bg-muted/60 rounded-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* Results Section Header & Grid Skeleton */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-36 bg-muted/80 rounded-none" />
                        <div className="h-5 w-16 bg-muted/60 rounded-none" />
                    </div>
                    {mode === "contributor" && (
                        <div className="h-9 w-52 bg-[#1473E6]/25 rounded-none" />
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {Array.from({ length: cardCount }).map((_, idx) => (
                        <AssetCardSkeleton key={idx} />
                    ))}
                </div>
            </div>
        </div>
    );
}
