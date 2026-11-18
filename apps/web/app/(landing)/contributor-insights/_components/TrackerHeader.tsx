"use client";

import React from "react";
import { Key, Sparkles, UserCheck } from "lucide-react";
import { ApifyKeyRecord } from "./types";

interface TrackerHeaderProps {
    keys: ApifyKeyRecord[];
    selectedKey: ApifyKeyRecord | null;
    onOpenSettings: () => void;
}

export default function TrackerHeader({
    keys,
    selectedKey,
    onOpenSettings
}: TrackerHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/60">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    LIVE ADOBE STOCK TRACKER & ANALYZER
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                    Adobe Stock <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Tracker</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    Inspect actual download counts, views, live keywords, and contributor portfolio performance.
                </p>
            </div>

            <div className="flex items-center gap-2.5 self-stretch md:self-auto shrink-0">
                {/* Active Account Pill */}
                {selectedKey && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 text-xs text-foreground font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                        <span className="text-muted-foreground">Apify:</span>
                        <span>{selectedKey.username ? `@${selectedKey.username}` : selectedKey.label}</span>
                    </div>
                )}

                {/* API Settings Trigger */}
                <button
                    onClick={onOpenSettings}
                    type="button"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground hover:border-border text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                    <Key className="w-3.5 h-3.5 text-primary" />
                    <span>API Settings</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                        • {keys.length > 0 ? `${keys.length} saved` : "Connect"}
                    </span>
                </button>
            </div>
        </div>
    );
}
