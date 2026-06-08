"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BatchUploadPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Batch Upload</h2>
        <p className="text-muted-foreground">Upload multiple images at once (Premium Feature).</p>
      </div>

      <Card className="border-dashed border-2 bg-muted/5">
        <CardContent className="flex flex-col items-center justify-center h-80 text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-semibold text-xl">Drag & Drop up to 100 images</h3>
            <p className="text-sm text-muted-foreground">Upload folders or multiple files. We'll generate metadata for all of them in bulk.</p>
          </div>
          <Button size="lg" className="mt-4 opacity-50 cursor-not-allowed">Select Images</Button>
          <p className="text-xs text-primary font-medium mt-4">Upgrade to Pro or Agency plan to unlock Batch Processing.</p>
        </CardContent>
      </Card>
    </div>
  );
}
