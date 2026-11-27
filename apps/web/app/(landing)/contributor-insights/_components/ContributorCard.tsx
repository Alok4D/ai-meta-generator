"use client";

import React, { useState } from "react";
import {
    ExternalLink,
    Copy,
    Check,
    Flame,
    Layers,
    MapPin,
    FileStack,
    Camera,
    PenTool,
    Palette,
    Video,
    Music,
    Layout,
    Box
} from "lucide-react";
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
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {/* Total Assets in Entire Portfolio */}
                    <div className="bg-[#1473E6]/5 border border-[#1473E6]/25 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#1473E6] uppercase tracking-wider mb-1">
                            <FileStack className="w-3 h-3 text-[#1473E6]" />
                            <span>Total Assets</span>
                        </div>
                        <div className="text-xl font-bold text-[#1473E6]">
                            {(summary.totalAssets ?? summary.totalLoaded).toLocaleString()}
                        </div>
                    </div>

                    {/* Loaded Assets (Current Page) */}
                    <div className="bg-muted/30 border border-border/80 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            <Layers className="w-3 h-3 text-[#1473E6]" />
                            <span>Loaded Assets</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {summary.totalLoaded}
                        </div>
                    </div>

                    {/* Total Downloads (Overall) */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            <span>Downloads</span>
                        </div>
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                            {summary.totalSampleDownloads.toLocaleString()}
                        </div>
                    </div>

                    {/* Vectors Downloads */}
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                            <PenTool className="w-3 h-3" />
                            <span>Vectors</span>
                        </div>
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {(summary.typeDownloads?.vector ?? 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Photos Downloads */}
                    <div className="bg-sky-500/5 border border-sky-500/20 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
                            <Camera className="w-3 h-3" />
                            <span>Photos</span>
                        </div>
                        <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
                            {(summary.typeDownloads?.photo ?? 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Illustrations Downloads */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                            <Palette className="w-3 h-3" />
                            <span>Illustrations</span>
                        </div>
                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {(summary.typeDownloads?.illustration ?? 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Videos Downloads */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-none p-3 text-center min-w-[95px]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                            <Video className="w-3 h-3" />
                            <span>Videos</span>
                        </div>
                        <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                            {(summary.typeDownloads?.video ?? 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Audio Downloads (if present or > 0) */}
                    {(summary.typeDownloads?.audio ?? 0) > 0 && (
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-none p-3 text-center min-w-[95px]">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                                <Music className="w-3 h-3" />
                                <span>Audio</span>
                            </div>
                            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                {summary.typeDownloads!.audio!.toLocaleString()}
                            </div>
                        </div>
                    )}

                    {/* Templates Downloads (if present or > 0) */}
                    {(summary.typeDownloads?.template ?? 0) > 0 && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-none p-3 text-center min-w-[95px]">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                                <Layout className="w-3 h-3" />
                                <span>Templates</span>
                            </div>
                            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {summary.typeDownloads!.template!.toLocaleString()}
                            </div>
                        </div>
                    )}

                    {/* 3D Downloads (if present or > 0) */}
                    {(summary.typeDownloads?.['3d'] ?? 0) > 0 && (
                        <div className="bg-teal-500/5 border border-teal-500/20 rounded-none p-3 text-center min-w-[95px]">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                                <Box className="w-3 h-3" />
                                <span>3D</span>
                            </div>
                            <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
                                {summary.typeDownloads!['3d']!.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
