"use client";

import React from "react";
import { Calendar, Flame, RotateCcw } from "lucide-react";
import { DateRangePreset } from "./types";

interface DateRangeBannerProps {
    dateRange: DateRangePreset;
    onDateRangeChange: (preset: DateRangePreset) => void;
    startDate: string;
    endDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
    onApplyCustomRange: () => void;
    soldOnly: boolean;
    onSoldOnlyChange: (val: boolean) => void;
    visibleCount: number;
    totalRangeDownloads: number;
    isLoading: boolean;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
    { id: "all", label: "All Time" },
    { id: "7d", label: "Last 7 Days" },
    { id: "14d", label: "Last 14 Days" },
    { id: "1m", label: "Last 1 Month" },
    { id: "3m", label: "Last 3 Months" },
    { id: "6m", label: "Last 6 Months" },
    { id: "custom", label: "Custom" }
];

export default function DateRangeBanner({
    dateRange,
    onDateRangeChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onApplyCustomRange,
    soldOnly,
    onSoldOnlyChange,
    visibleCount,
    totalRangeDownloads,
    isLoading
}: DateRangeBannerProps) {
    return (
        <div className="bg-card border border-border/80 rounded-none p-3.5 sm:px-5 flex flex-col gap-3">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                {/* Left: Label & Preset Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mr-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1473E6]" />
                        <span>Upload Period:</span>
                    </div>

                    <div className="flex flex-wrap items-center border border-border/80 bg-muted/30 rounded-none">
                        {PRESETS.map((preset, idx) => {
                            const isActive = dateRange === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => onDateRangeChange(preset.id)}
                                    className={`px-3 py-1.5 text-xs transition-colors cursor-pointer rounded-none disabled:opacity-50 ${
                                        idx > 0 ? "border-l border-border/80" : ""
                                    } ${
                                        isActive
                                            ? "bg-[#1473E6] text-white font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    {dateRange !== "all" && (
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => onDateRangeChange("all")}
                            title="Reset to All Time"
                            className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/80 bg-muted/20 hover:bg-muted/60 rounded-none flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>

                {/* Right: Sold Only Toggle & Live Range Stats */}
                <div className="flex items-center gap-3 flex-wrap justify-between xl:justify-end">
                    <button
                        type="button"
                        onClick={() => onSoldOnlyChange(!soldOnly)}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-none flex items-center gap-1.5 transition-colors cursor-pointer ${
                            soldOnly
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold"
                                : "bg-muted/20 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Flame className={`w-3.5 h-3.5 ${soldOnly ? "fill-amber-500 text-amber-500" : ""}`} />
                        <span>Sold Only (&gt; 0 DL)</span>
                    </button>

                    <div className="text-xs text-muted-foreground border-l border-border/80 pl-3">
                        <strong className="text-foreground">{visibleCount}</strong>{" "}
                        {visibleCount === 1 ? "file" : "files"}
                        {dateRange !== "all" && (
                            <span>
                                {" "}
                                • <strong className="text-[#1473E6]">{totalRangeDownloads.toLocaleString()}</strong> DL in range
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Date Range Picker Row */}
            {dateRange === "custom" && (
                <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="text-muted-foreground font-medium">Custom Range:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="px-2.5 py-1.5 bg-background border border-border/80 rounded-none text-xs text-foreground focus:outline-none focus:border-[#1473E6]"
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="px-2.5 py-1.5 bg-background border border-border/80 rounded-none text-xs text-foreground focus:outline-none focus:border-[#1473E6]"
                    />
                    <button
                        type="button"
                        disabled={isLoading || !startDate || !endDate}
                        onClick={onApplyCustomRange}
                        className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0d66d0] text-white font-semibold rounded-none transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                        Apply Range
                    </button>
                </div>
            )}
        </div>
    );
}
