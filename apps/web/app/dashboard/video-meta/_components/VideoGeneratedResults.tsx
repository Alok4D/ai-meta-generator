"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Copy, Check, Camera, SunMedium, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface VideoGeneratedResultsProps {
  metadata: any;
  handleDownloadTXT: () => void;
  handleDownloadCSV: (preset?: string) => void;
  handleCopy: (text: string | undefined, label: string) => void;
  handleRegenerate: () => void;
  isRegenerating: boolean;
}

export function VideoGeneratedResults({
  metadata,
  handleDownloadTXT,
  handleDownloadCSV,
  handleCopy,
  handleRegenerate,
  isRegenerating
}: VideoGeneratedResultsProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [showAllKeywords, setShowAllKeywords] = useState(true);
  const isFreePlan = !user?.activePlan || user?.activePlan?.name?.toLowerCase() === 'free';

  const onCsvClick = () => {
    if (isFreePlan) {
      Swal.fire({
        icon: 'warning',
        title: 'Upgrade Required',
        text: 'CSV download for stock video agencies is available on premium plans. Upgrade to unlock bulk CSV export.',
        confirmButtonText: 'View Pricing',
        confirmButtonColor: '#6366f1',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/dashboard/pricing');
        }
      });
    } else {
      handleDownloadCSV('universal');
    }
  };

  return (
    <Card className="flex-1 border-muted/60 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-xl">Generated Video Metadata</CardTitle>
        </div>
        {metadata && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadTXT}>
              <Download className="w-3.5 h-3.5 mr-1" /> TXT
            </Button>
            <Button variant="default" size="sm" onClick={onCsvClick}>
              <Download className="w-3.5 h-3.5 mr-1" /> Universal CSV
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {metadata ? (
          <div className="space-y-6">
            {/* Detected Camera & Mood Badges */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider">AI Detected:</span>
              {metadata.shotType && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary font-semibold rounded-md flex items-center gap-1 border border-primary/20">
                  <Camera className="w-3 h-3" /> {metadata.shotType}
                </span>
              )}
              {metadata.mood && (
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold rounded-md flex items-center gap-1 border border-amber-500/20">
                  <SunMedium className="w-3 h-3" /> {metadata.mood}
                </span>
              )}
              {metadata.category && (
                <span className="px-2.5 py-1 bg-background text-foreground font-medium rounded-md border shadow-sm capitalize">
                  📂 {metadata.category}
                </span>
              )}
            </div>

            {/* Action Title Section */}
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  Action Title (Stock Footage Ready)
                </h4>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5 text-primary" onClick={() => handleCopy(metadata.title, 'Action Title')}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Title
                </Button>
              </div>
              <div className="p-3.5 bg-muted/50 border border-muted/60 rounded-xl text-sm font-medium leading-relaxed text-foreground">
                {metadata.title}
              </div>
            </div>

            {/* Description Section */}
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Commercial Description
                </h4>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5 text-primary" onClick={() => handleCopy(metadata.description, 'Description')}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Description
                </Button>
              </div>
              <div className="p-3.5 bg-muted/50 border border-muted/60 rounded-xl text-sm leading-relaxed text-foreground/90">
                {metadata.description}
              </div>
            </div>

            {/* Multi-Agency Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Adobe Category</span>
                <p className="text-sm font-medium capitalize text-foreground">{metadata.adobeCategory || metadata.category || 'Nature'}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Shutterstock Category</span>
                <p className="text-sm font-medium capitalize text-foreground">{metadata.shutterstockCategory || metadata.category || 'Nature'}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Pond5 Category</span>
                <p className="text-sm font-medium capitalize text-foreground">{metadata.pond5Category || metadata.category || 'Nature'}</p>
              </div>
            </div>

            {/* Keywords Section (49 Keywords) */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Keywords ({metadata.keywords?.length || 49}) - 4-Layer Pyramid
                </h4>
                <div className="flex items-center gap-2">
                  {metadata.keywords?.length > 20 && (
                    <button 
                      onClick={() => setShowAllKeywords(!showAllKeywords)} 
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showAllKeywords ? "Show Less" : `Show All (${metadata.keywords.length})`}
                    </button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5 text-primary" onClick={() => handleCopy(metadata.keywords?.join(', '), 'Keywords')}>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy All
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-muted/20 rounded-xl border border-border/60 max-h-56 overflow-y-auto">
                {(showAllKeywords ? metadata.keywords : metadata.keywords.slice(0, 20)).map((kw: string, i: number) => (
                  <span 
                    key={i} 
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border shadow-xs transition-colors ${
                      i < 10 
                        ? 'bg-primary/10 border-primary/30 text-primary font-semibold' 
                        : 'bg-background text-foreground border-border/60'
                    }`}
                    title={i < 10 ? 'High Priority Top 10 Search Term' : undefined}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Regenerate Output Button */}
            <Button 
              variant="default" 
              className="w-full mt-4 py-6 font-semibold shadow-md flex items-center justify-center gap-2"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Regenerating Video Metadata...
                </div>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Regenerate Output (2 Credits)
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-16">
            <div className="p-4 bg-muted/40 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">No Video Analyzed Yet</p>
              <p className="text-xs text-muted-foreground">Upload a stock video footage clip to generate action titles and 49 buyer-intent keywords</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
