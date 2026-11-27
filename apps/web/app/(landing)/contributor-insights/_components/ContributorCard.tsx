"use client";

import React, { useState } from "react";
import { ExternalLink, Copy, Check, TrendingUp, Flame, BarChart2, Layers, MapPin } from "lucide-react";
import { ContributorSummary } from "./types";

interface ContributorCardProps {
    summary: ContributorSummary;
}

export default function ContributorCard({ summary }: ContributorCardProps) {
    const [copiedId, setCopiedId] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(String(summary.creatorId));
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    return (
        <div className="bg-card border border-border/80 rounded-none p-5 sm:p-6 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Contributor Identity (Left Side) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-none bg-[#1473E6]/10 text-[#1473E6] border border-[#1473E6]/25">
                            Adobe Stock Contributor
                        </span>
                        {summary.creatorCountry && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-rose-500" /> {summary.creatorCountry}
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        {summary.creatorName}
                    </h2>

                    <div className="flex items-center gap-3.5 text-xs text-muted-foreground flex-wrap pt-0.5">
                        <span className="font-mono flex items-center gap-1.5">
                            Contributor ID: <strong className="text-foreground font-semibold">{summary.creatorId}</strong>
                        </span>

                        <button
                            type="button"
                            onClick={handleCopyId}
                            className="text-[#1473E6] hover:text-[#0d66d0] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId ? "Copied" : "Copy ID"}</span>
                        </button>

                        {summary.creatorUrl && (
                            <a
                                href={summary.creatorUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1 hover:underline underline-offset-4"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>stock.adobe.com Profile</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Adobe Analytics Stat Widgets (Right Side) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-auto w-full">
                    {/* Loaded Assets */}
                    <div className="bg-muted/30 border border-border/80 rounded-none p-3.5 text-center min-w-[105px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            <Layers className="w-3 h-3 text-[#1473E6]" />
                            <span>Loaded Assets</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {summary.totalLoaded}
                        </div>
                    </div>

                    {/* Total Downloads */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-none p-3.5 text-center min-w-[105px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            <span>Downloads</span>
                        </div>
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                            {summary.totalSampleDownloads.toLocaleString()}
                        </div>
                    </div>

                    {/* Average Downloads per Asset */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-none p-3.5 text-center min-w-[105px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Avg / File</span>
                        </div>
                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {summary.avgDownloads}
                        </div>
                    </div>

                    {/* Median Downloads */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-none p-3.5 text-center min-w-[105px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                            <BarChart2 className="w-3 h-3" />
                            <span>Median DL</span>
                        </div>
                        <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {summary.medianDownloads}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
