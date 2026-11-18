"use client";

import React, { useState } from "react";
import { User, ExternalLink, Copy, Check, TrendingUp, Flame, BarChart2, Layers } from "lucide-react";
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
        <div className="bg-gradient-to-br from-blue-950/40 via-card/80 to-card border border-blue-500/20 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Creator Identity */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20 shrink-0">
                        {summary.creatorName?.charAt(0)?.toUpperCase() || "A"}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                Contributor Portfolio
                            </span>
                            {summary.creatorCountry && (
                                <span className="text-xs text-muted-foreground font-medium">
                                    📍 {summary.creatorCountry}
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mt-1">
                            {summary.creatorName}
                        </h2>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                                Adobe Stock ID: <strong className="text-foreground">{summary.creatorId}</strong>
                            </span>

                            <button
                                type="button"
                                onClick={handleCopyId}
                                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedId ? "Copied" : "Copy ID"}</span>
                            </button>

                            {summary.creatorUrl && (
                                <a
                                    href={summary.creatorUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Visit Adobe Profile</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4 Analytics Stat Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:w-auto w-full">
                    <div className="bg-background/60 border border-border/60 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                            <Layers className="w-3 h-3 text-primary" />
                            <span>Sample Assets</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {summary.totalLoaded}
                        </div>
                    </div>

                    <div className="bg-background/60 border border-border/60 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                            <Flame className="w-3 h-3 text-amber-500" />
                            <span>Downloads</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {summary.totalSampleDownloads.toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-background/60 border border-border/60 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span>Avg / File</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {summary.avgDownloads}
                        </div>
                    </div>

                    <div className="bg-background/60 border border-border/60 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                            <BarChart2 className="w-3 h-3 text-indigo-500" />
                            <span>Median DL</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {summary.medianDownloads}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
