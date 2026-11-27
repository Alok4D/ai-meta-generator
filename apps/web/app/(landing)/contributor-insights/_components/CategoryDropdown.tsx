"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Layers, Camera, PenTool, Palette, Video, Music, Layout, Box, Sparkles, Crown } from "lucide-react";
import { FileTypeFilter } from "./types";

interface CategoryDropdownProps {
    fileType: FileTypeFilter;
    onFileTypeChange: (type: FileTypeFilter) => void;
}

export default function CategoryDropdown({
    fileType,
    onFileTypeChange
}: CategoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options: { id: FileTypeFilter; label: string; icon: React.ReactNode; isDivider?: boolean }[] = [
        { id: "all", label: "All", icon: <Layers className="w-3.5 h-3.5" /> },
        { id: "photo", label: "Photos", icon: <Camera className="w-3.5 h-3.5" /> },
        { id: "vector", label: "Vectors", icon: <PenTool className="w-3.5 h-3.5" /> },
        { id: "illustration", label: "Illustrations", icon: <Palette className="w-3.5 h-3.5" /> },
        { id: "video", label: "Videos", icon: <Video className="w-3.5 h-3.5" /> },
        { id: "audio", label: "Audio", icon: <Music className="w-3.5 h-3.5" /> },
        { id: "template", label: "Templates", icon: <Layout className="w-3.5 h-3.5" /> },
        { id: "3d", label: "3D", icon: <Box className="w-3.5 h-3.5" /> },
        { id: "free", label: "Free", icon: <Sparkles className="w-3.5 h-3.5" />, isDivider: true },
        { id: "premium", label: "Premium", icon: <Crown className="w-3.5 h-3.5" /> }
    ];

    const current = options.find(o => o.id === fileType) ?? options[0]!;

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors cursor-pointer select-none rounded-none border-r border-border/80 h-full"
            >
                <span>{current.label}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-[#1E1E1E] text-white border border-[#383838] shadow-lg z-50 py-1 rounded-[2px]">
                    {options.map((opt) => (
                        <React.Fragment key={opt.id}>
                            {opt.isDivider && (
                                <div className="my-1 border-t border-[#383838]" />
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    onFileTypeChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer rounded-none text-left ${
                                    fileType === opt.id
                                        ? "bg-[#1473E6] text-white font-medium"
                                        : "text-[#D0D0D0] hover:bg-[#2A2A2A] hover:text-white"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {opt.icon}
                                    <span>{opt.label}</span>
                                </div>
                                {fileType === opt.id && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
