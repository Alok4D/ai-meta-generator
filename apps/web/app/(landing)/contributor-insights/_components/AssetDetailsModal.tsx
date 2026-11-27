"use client";

import React, { useState } from "react";
import { X, Copy, Check, Flame, Tag, Sparkles, ExternalLink } from "lucide-react";
import { AdobeAssetItem } from "./types";

const ADOBE_FONT_FAMILY =
    'adobe-clean, "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Trebuchet MS", "Lucida Grande", sans-serif';

interface AssetDetailsModalProps {
    asset: AdobeAssetItem | null;
    onClose: () => void;
}

export default function AssetDetailsModal({ asset, onClose }: AssetDetailsModalProps) {
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState(false);
    const [copiedTitle, setCopiedTitle] = useState(false);

    if (!asset) return null;

    const handleCopyId = () => {
        navigator.clipboard.writeText(String(asset.id));
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 1500);
    };

    const handleCopyTitle = () => {
        if (!asset.title) return;
        navigator.clipboard.writeText(asset.title);
        setCopiedTitle(true);
        setTimeout(() => setCopiedTitle(false), 1500);
    };

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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-text"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="relative w-full max-w-5xl bg-card border border-border/80 rounded-none shadow-2xl overflow-hidden max-h-[92vh] flex flex-col select-text"
            >
                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-none flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 pt-10 sm:pt-7 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: Image / Video Preview & Full Technical Metadata */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                        <div className="relative w-full aspect-video md:aspect-square bg-muted/30 border border-border/60 rounded-none overflow-hidden flex items-center justify-center">
                            {(asset.isVideo || asset.mediaType?.toLowerCase().includes("video")) &&
                            (asset.videoPreviewUrl || asset.videoSmallPreviewUrl) ? (
                                <video
                                    src={asset.videoPreviewUrl || asset.videoSmallPreviewUrl || undefined}
                                    poster={asset.thumbnailUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            ) : asset.thumbnailUrl ? (
                                <img
                                    src={asset.thumbnailUrl}
                                    alt={asset.title}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-muted-foreground text-xs">Preview unavailable</div>
                            )}

                            {asset.isGenerativeAi && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-none text-[10px] font-bold bg-[#42a5f5]/15 text-[#1473E6] border border-[#42a5f5]/30 backdrop-blur-md flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI Generated
                                </div>
                            )}
                        </div>

                        {/* Complete Asset Technical Details */}
                        <div className="bg-muted/20 border border-border/60 rounded-none p-4 space-y-2.5 text-[13px]">
                            <div className="text-sm font-semibold text-foreground pb-2 border-b border-border/50">
                                Asset Information
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Asset ID</span>
                                <button
                                    type="button"
                                    onClick={handleCopyId}
                                    title="Click to copy Asset ID"
                                    className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-[#1473E6] transition-colors cursor-pointer"
                                >
                                    <span style={{ fontFamily: ADOBE_FONT_FAMILY }}>#{asset.id}</span>
                                    {copiedId ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Creator</span>
                                <span className="font-medium text-foreground text-right">
                                    {asset.creatorName}{" "}
                                    <span style={{ fontFamily: ADOBE_FONT_FAMILY }} className="text-muted-foreground">
                                        ({asset.creatorId})
                                    </span>
                                </span>
                            </div>
                            {asset.width && asset.height ? (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">Dimensions</span>
                                    <span style={{ fontFamily: ADOBE_FONT_FAMILY }} className="font-medium text-foreground">
                                        {asset.width} × {asset.height} px
                                    </span>
                                </div>
                            ) : null}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">AI Content</span>
                                <span className="font-medium text-foreground">
                                    {asset.isGenerativeAi ? "AI Generated" : "Standard"}
                                </span>
                            </div>
                            {asset.createdAt && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">Uploaded</span>
                                    <span style={{ fontFamily: ADOBE_FONT_FAMILY }} className="font-medium text-foreground">
                                        {new Date(asset.createdAt).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Metadata & Full Keywords */}
                    <div className="md:col-span-7 flex flex-col gap-5">
                        {/* Metric Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:pr-8">
                            <div className="bg-[#42a5f5] border border-[#42a5f5] rounded-none p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                                    <Flame className="w-3.5 h-3.5 fill-white text-white" />
                                    <span>Downloads</span>
                                </div>
                                <div
                                    style={{
                                        fontFamily: ADOBE_FONT_FAMILY,
                                        fontSize: "24px",
                                        fontWeight: 300,
                                        lineHeight: "32px",
                                        letterSpacing: "2px"
                                    }}
                                    className="text-white"
                                >
                                    {asset.downloads}
                                </div>
                            </div>

                            <div className="bg-muted/50 border border-border/60 rounded-none p-3 text-center flex flex-col justify-center">
                                <div className="text-xs font-medium text-muted-foreground mb-0.5">
                                    Type
                                </div>
                                <div className="text-sm font-bold text-foreground capitalize">
                                    {asset.mediaType}
                                </div>
                            </div>

                            <div className="bg-muted/50 border border-border/60 rounded-none p-3 text-center flex flex-col justify-center">
                                <div className="text-xs font-medium text-muted-foreground mb-0.5">
                                    Category
                                </div>
                                <div className="text-sm font-bold text-foreground capitalize leading-tight">
                                    {asset.categoryName || "General"}
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Asset Title
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyTitle}
                                    className="text-xs text-[#1473E6] hover:text-[#0d66d0] transition-colors flex items-center gap-1 bg-[#1473E6]/10 border border-[#1473E6]/25 px-2 py-0.5 rounded-none font-medium cursor-pointer"
                                >
                                    {copiedTitle ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedTitle ? "Copied!" : "Copy Title"}</span>
                                </button>
                            </div>
                            <h2 className="text-base font-semibold text-foreground leading-snug select-text cursor-text">
                                {asset.title}
                            </h2>
                        </div>

                        {/* Keywords Section */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-[#1473E6]" />
                                    <span className="text-xs font-semibold text-foreground">
                                        Keywords (
                                        <span style={{ fontFamily: ADOBE_FONT_FAMILY }}>
                                            {asset.keywords?.length || 0}
                                        </span>
                                        )
                                    </span>
                                </div>

                                <button
                                    onClick={handleCopyAll}
                                    type="button"
                                    className="text-xs text-[#1473E6] hover:text-[#0d66d0] transition-colors flex items-center gap-1 bg-[#1473E6]/10 border border-[#1473E6]/25 px-2.5 py-1 rounded-none font-medium cursor-pointer"
                                >
                                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedAll ? "Copied All!" : "Copy All Keywords"}</span>
                                </button>
                            </div>

                            {/* Keywords Chips (All keywords visible) */}
                            <div className="bg-muted/20 border border-border/60 rounded-none p-3 flex flex-wrap gap-1.5">
                                {asset.keywords && asset.keywords.length > 0 ? (
                                    asset.keywords.map((kw, idx) => {
                                        const isThisCopied = copiedKeyword === kw;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleCopySingleKeyword(kw)}
                                                title="Click to copy keyword"
                                                className={`px-2 py-1 rounded-none text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                                    isThisCopied
                                                        ? "bg-emerald-500 text-white border-emerald-500"
                                                        : "bg-background hover:bg-muted text-foreground border-border/70 shadow-2xs hover:border-[#1473E6]/40"
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

                        {/* View on Adobe Stock Button */}
                        <a
                            href={asset.url || `https://stock.adobe.com/${asset.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0d66d0] text-white font-semibold rounded-none text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View on Adobe Stock</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
