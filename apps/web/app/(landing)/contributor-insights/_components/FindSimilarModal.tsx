"use client";

import React, { useRef, useState } from "react";
import { X } from "lucide-react";

interface FindSimilarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: File) => void;
}

export default function FindSimilarModal({
  isOpen,
  onClose,
  onFileSelect,
}: FindSimilarModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file?: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    onFileSelect?.(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] rounded-[4px] bg-[#1E1E1E] px-6 py-6 shadow-2xl sm:px-9 sm:py-7 border border-[#383838]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#383838] pb-3.5">
          <h2 className="text-[17px] font-semibold tracking-tight text-white">
            Find similar
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#8E8E8E] transition-colors hover:text-white cursor-pointer"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        </div>

        {/* Dashed Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-5 flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-colors sm:min-h-[350px] ${
            isDragging
              ? "border-[#2680EB] bg-[#242424]"
              : "border-[#444444] bg-transparent"
          }`}
        >
          {/* Custom Image + Audio Upload SVG */}
          <svg
            viewBox="0 0 120 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[82px] w-[104px] text-[#666666]"
            aria-hidden="true"
          >
            {/* Upward Arrow */}
            <path
              d="M60 34V10M60 10L51 19M60 10L69 19"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Right Tilted Audio File Icon */}
            <g transform="rotate(28 84 58)">
              <path
                d="M67 35H86L97 46V77C97 78.6569 95.6569 80 94 80H67C65.3431 80 64 78.6569 64 77V38C64 36.3431 65.3431 35 67 35Z"
                fill="#1E1E1E"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Audio Waveform Bars */}
              <path
                d="M70 57V60M74 53V64M78 49V68M82 54V63M86 51V66M90 56V61"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </g>

            {/* Left Tilted Image Icon */}
            <g transform="rotate(-16 38 60)">
              <rect
                x="12"
                y="40"
                width="50"
                height="38"
                rx="2.5"
                fill="#1E1E1E"
                stroke="currentColor"
                strokeWidth="3.2"
              />
              {/* Sun */}
              <circle
                cx="49"
                cy="51"
                r="3.5"
                stroke="currentColor"
                strokeWidth="2.6"
              />
              {/* Mountains */}
              <path
                d="M14 77L28 57L41 70L47 63L60 77"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>

          {/* Main Instruction Text */}
          <p className="mt-5 text-[20px] font-light text-[#8E8E8E] sm:text-[23px]">
            Drag &amp; drop an image or audio file
          </p>

          {/* Secondary Action Link */}
          <p className="mt-1.5 text-[13px] text-[#8E8E8E]">
            or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[#1473E6] hover:underline cursor-pointer"
            >
              select a file
            </button>
          </p>

          {selectedFileName && (
            <p className="mt-3 text-xs text-[#A3A3A3]">
              Selected: {selectedFileName}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
