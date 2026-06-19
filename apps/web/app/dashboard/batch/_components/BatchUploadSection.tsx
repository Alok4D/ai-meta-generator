"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DropzoneState } from "react-dropzone";

interface BatchUploadSectionProps {
  hasAccess: boolean;
  onUpgradeClick: () => void;
  dropzone: DropzoneState;
  maxBatchSize?: number;
}

export function BatchUploadSection({ hasAccess, onUpgradeClick, dropzone, maxBatchSize = 50 }: BatchUploadSectionProps) {
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <Card className="border-dashed border-2 bg-muted/5">
      <CardContent className="flex flex-col items-center justify-center h-80 text-center space-y-4 p-6">
        {!hasAccess ? (
          <div 
            onClick={onUpgradeClick}
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors hover:bg-muted/50"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <div className="space-y-2 max-w-sm text-center">
              <h3 className="font-semibold text-xl">
                {maxBatchSize === Infinity ? 'Drag & Drop unlimited images' : `Drag & Drop up to ${maxBatchSize} images`}
              </h3>
              <p className="text-sm text-muted-foreground">JPG, PNG, SVG, WEBP, AVIF or EPS</p>
              <p className="text-xs text-primary font-medium mt-2">Pro or Agency Plan Required</p>
            </div>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors ${isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}`}
          >
            <input {...getInputProps()} />
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <div className="space-y-2 max-w-sm text-center">
              <h3 className="font-semibold text-xl">
                {maxBatchSize === Infinity ? 'Drag & Drop unlimited images' : `Drag & Drop up to ${maxBatchSize} images`}
              </h3>
              <p className="text-sm text-muted-foreground">JPG, PNG, SVG, WEBP, AVIF or EPS</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
