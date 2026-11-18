"use client";

import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, Flame, Eye, Tag, Calendar, Layers, Image as ImageIcon, Sparkles } from "lucide-react";
import { AdobeAssetItem } from "./types";

interface AssetDetailsModalProps {
    asset: AdobeAssetItem | null;
    onClose: () => void;
}

export default function AssetDetailsModal({ asset, onClose }: AssetDetailsModalProps) {
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

    if (!asset) return null;

    const handleCopyAll = () => {
        if (!asset.keywords?.length) return;
        navigator.clipboard.writeText(asset.keywords.join(", "));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleCopySingleKeyword = (kw: string) => {
        navigator.clipboard.writeText(kw);
        setCopiedKeyword(kw);
        setTimeout(() => setCopiedKeyword(null), 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {asset.mediaType}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                            ID: #{asset.id}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: Image Preview & Direct Links */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                        <div className="relative w-full aspect-video md:aspect-square bg-muted/30 border border-border/60 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                            {asset.thumbnailUrl ? (
                                <img
                                    src={asset.thumbnailUrl}
                                    alt={asset.title}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-muted-foreground text-xs">Preview unavailable</div>
                            )}

                            {asset.isGenerativeAi && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                                    <Sparkles className="w-3 h-3" /> AI Generated
                                </div>
                            )}
                        </div>

                        {/* Adobe Stock External Link Button */}
                        <a
                            href={asset.url || `https://stock.adobe.com/${asset.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View on Adobe Stock</span>
                        </a>
                    </div>

                    {/* Right Column: Metadata & Full Keywords */}
                    <div className="md:col-span-7 flex flex-col gap-5">
                        {/* Title */}
                        <div>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Asset Title
                            </span>
                            <h2 className="text-base font-semibold text-foreground leading-snug">
                                {asset.title}
                            </h2>
                        </div>

                        {/* Metric Highlights */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
                                <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase mb-0.5">
                                    <Flame className="w-3 h-3 fill-amber-500" />
                                    <span>Downloads</span>
                                </div>
                                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    {asset.downloads}
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 text-center">
                                <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase mb-0.5">
                                    <Eye className="w-3 h-3" />
                                    <span>Views</span>
                                </div>
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {asset.views}
                                </div>
                            </div>

                            <div className="bg-muted/50 border border-border/60 rounded-xl p-2.5 text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                                    Type
                                </div>
                                <div className="text-sm font-bold text-foreground capitalize truncate">
                                    {asset.mediaType}
                                </div>
                            </div>

                            <div className="bg-muted/50 border border-border/60 rounded-xl p-2.5 text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                                    Category
                                </div>
                                <div className="text-sm font-bold text-foreground capitalize truncate" title={asset.categoryName}>
                                    {asset.categoryName || 'General'}
                                </div>
                            </div>
                        </div>

                        {/* Contributor info line */}
                        <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Creator:</span>
                                <span className="font-semibold text-foreground">{asset.creatorName}</span>
                                <span className="text-muted-foreground font-mono">({asset.creatorId})</span>
                            </div>

                            {asset.createdAt && (
                                <div className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Keywords Section */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-semibold text-foreground">
                                        Keywords ({asset.keywords?.length || 0})
                                    </span>
                                </div>

                                <button
                                    onClick={handleCopyAll}
                                    type="button"
                                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
                                >
                                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedAll ? "Copied All!" : "Copy All Keywords"}</span>
                                </button>
                            </div>

                            {/* Keywords Chips */}
                            <div className="bg-muted/20 border border-border/60 rounded-xl p-3 flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                                {asset.keywords && asset.keywords.length > 0 ? (
                                    asset.keywords.map((kw, idx) => {
                                        const isThisCopied = copiedKeyword === kw;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleCopySingleKeyword(kw)}
                                                title="Click to copy keyword"
                                                className={`px-2 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                                    isThisCopied
                                                        ? "bg-emerald-500 text-white border-emerald-500 scale-105"
                                                        : "bg-background hover:bg-muted text-foreground border-border/70 shadow-2xs hover:border-primary/40"
                                                }`}
                                            >
                                                <span>{kw}</span>
                                                {isThisCopied && <Check className="w-2.5 h-2.5" />}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">No keywords available for this asset.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
