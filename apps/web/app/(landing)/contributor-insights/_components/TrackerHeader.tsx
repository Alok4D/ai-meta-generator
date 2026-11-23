"use client";

import React from "react";
import { Key, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-border/60">
            {/* Adobe Stock Brand Identity */}
            <div className="flex items-start gap-4">
                {/* Adobe Red 'St' / 'A' Brand Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#EB1000] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#EB1000]/25 shrink-0 tracking-tighter">
                    St
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#EB1000] bg-[#EB1000]/10 px-2.5 py-0.5 rounded-full border border-[#EB1000]/20">
                            Adobe Stock Intelligence
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            Live Contributor & Asset Tracker
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        <span>Adobe Stock</span>
                        <span className="text-[#1473E6] font-black">Tracker</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Inspect real-time download counts, portfolio revenue metrics, live keyword tags, and asset rankings.
                    </p>
                </div>
            </div>

            {/* Top Right Controls (Apify Settings & Active Account) */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto shrink-0 flex-wrap">
                {/* Active Apify Account Badge */}
                {selectedKey && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/80 text-xs text-foreground font-medium shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-muted-foreground">Apify:</span>
                        <span className="font-semibold">{selectedKey.username ? `@${selectedKey.username}` : selectedKey.label}</span>
                    </div>
                )}

                {/* API Settings Trigger Button (Adobe Outline Pill Style) */}
                <button
                    onClick={onOpenSettings}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-muted border border-border/80 text-foreground text-xs font-semibold transition-all hover:border-[#1473E6]/60 shadow-xs cursor-pointer"
                >
                    <Key className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>API Settings</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-medium">
                        {keys.length > 0 ? `${keys.length} saved` : "Connect"}
                    </span>
                </button>
            </div>
        </div>
    );
}
