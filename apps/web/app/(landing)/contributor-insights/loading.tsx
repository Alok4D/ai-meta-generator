import React from "react";

export default function ContributorInsightsLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
                {/* Search Controls Skeleton */}
                <div className="space-y-3 animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-11 bg-card border border-border/80 rounded-none" />
                        <div className="h-11 w-28 bg-[#1473E6]/25 rounded-none" />
                        <div className="h-11 w-11 bg-card border border-border/80 rounded-none" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-52 bg-card border border-border/80 rounded-none" />
                        <div className="h-6 w-24 bg-muted/60 rounded-none" />
                    </div>
                </div>

                {/* Blank State Skeleton */}
                <div className="bg-muted/20 border border-border/60 border-dashed rounded-none p-12 flex flex-col items-center justify-center gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-muted/70 rounded-none" />
                    <div className="h-4 w-48 bg-muted/80 rounded-none" />
                    <div className="h-3 w-80 max-w-full bg-muted/60 rounded-none" />
                </div>
            </div>
        </div>
    );
}
