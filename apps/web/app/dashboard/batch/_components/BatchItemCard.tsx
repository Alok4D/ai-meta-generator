"use client";

import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BatchItem } from "./BatchTypes";

interface BatchItemCardProps {
  item: BatchItem;
  isProcessing: boolean;
  onRemove: (id: string) => void;
}

export function BatchItemCard({ item, isProcessing, onRemove }: BatchItemCardProps) {
  return (
    <Card className={`overflow-hidden border-border/40 shadow-sm transition-all duration-300 ${item.status === 'processing' ? 'border-primary/50 ring-1 ring-primary/20 shadow-md' : ''}`}>
      <div className="flex flex-col md:flex-row">
        <div 
          className="w-full md:w-64 relative flex-shrink-0 flex items-center justify-center min-h-[14rem] overflow-hidden group cursor-zoom-in"
          onMouseMove={(e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            const img = e.currentTarget.querySelector('img');
            if (img) {
              img.style.transformOrigin = `${x}% ${y}%`;
            }
          }}
          onMouseLeave={(e) => {
            const img = e.currentTarget.querySelector('img');
            if (img) {
              setTimeout(() => { img.style.transformOrigin = 'center center'; }, 300);
            }
          }}
        >
          {item.metadata?.imageUrl ? (
            <img src={item.metadata.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[2]" />
          ) : (item.file.type === 'application/postscript' || item.file.name.toLowerCase().endsWith('.eps')) ? (
            <div className="text-center p-6 relative z-10 w-full h-full flex flex-col items-center justify-center bg-muted/30">
              <svg className="mx-auto text-foreground/80 mb-3 transition-transform duration-300 ease-out group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg>
              <h4 className="text-sm font-semibold text-foreground mb-1">EPS File</h4>
              <p className="text-[13px] text-muted-foreground mb-1">Preview unavailable</p>
              <p className="text-[11px] text-muted-foreground/70">Will be processed by AI after upload</p>
            </div>
          ) : (
            <img src={item.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[2]" />
          )}
        </div>
        
        <div className="flex-1 p-5 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 pb-3 border-b">
            <h3 className="font-medium text-sm truncate pr-4 text-muted-foreground flex items-center gap-2 max-w-[70%]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span className="truncate">{item.file.name}</span>
            </h3>
            
            <div className="flex-shrink-0 flex items-center gap-3">
              {!isProcessing && (
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-foreground/70 hover:text-red-500 transition-colors"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              )}
              <div>
                {item.status === 'success' && <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-md text-xs font-medium border border-green-500/20">Complete</span>}
                {item.status === 'pending' && <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium border">Pending</span>}
                {item.status === 'error' && <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded-md text-xs font-medium border border-red-500/20">Failed</span>}
                {item.status === 'processing' && <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 flex items-center gap-1.5"><svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing</span>}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {item.status === 'pending' && (
              <div className="grid grid-cols-3 gap-4 animate-in fade-in">
                <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-1">Size</span>
                  <p className="font-medium text-sm text-foreground">{(item.file.size! / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-1">Type</span>
                  <p className="font-medium text-sm text-foreground uppercase">{item.file.name.split('.').pop()}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-1">Dimensions</span>
                  <p className="font-medium text-sm text-foreground">
                    {item.dimensions ? (
                      item.dimensions.width === 0 ? "Vector" : `${item.dimensions.width}x${item.dimensions.height}`
                    ) : "..."}
                  </p>
                </div>
              </div>
            )}

            {item.status === 'processing' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                {/* Title Section Skeleton */}
                <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Generating Title...</span>
                  </div>
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Category Section Skeleton */}
                  <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Category</span>
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                  </div>

                  {/* Keywords Section Skeleton */}
                  <div className="md:col-span-3 bg-muted/30 p-3 rounded-lg border border-muted/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Extracting Keywords...</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-6 bg-muted animate-pulse rounded" style={{ width: `${Math.floor(Math.random() * 40) + 60}px` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {item.status === 'error' && (
              <div className="h-full flex flex-col items-center justify-center text-destructive py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-80"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <p className="font-medium text-sm">{item.error}</p>
              </div>
            )}

            {item.status === 'success' && item.metadata && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                {/* Title Section */}
                <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.metadata.platform === 'shutterstock' ? 'Description' : 'Title'}</span>
                    <button onClick={() => { navigator.clipboard.writeText(item.metadata.platform === 'shutterstock' ? item.metadata.description : item.metadata.title); toast.success("Copied!"); }} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copy
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-snug">{item.metadata.platform === 'shutterstock' ? item.metadata.description : item.metadata.title}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Category Section */}
                  <div className="bg-muted/30 p-3 rounded-lg border border-muted/50">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Category</span>
                    <p className="text-sm capitalize font-medium">{item.metadata.category}</p>
                  </div>

                  {/* Keywords Section */}
                  <div className="md:col-span-3 bg-muted/30 p-3 rounded-lg border border-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Keywords ({item.metadata.keywords.length})</span>
                      <button onClick={() => { navigator.clipboard.writeText(item.metadata.keywords.join(", ")); toast.success("Copied!"); }} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        Copy All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.metadata.keywords.slice(0, 18).map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-background border shadow-sm text-foreground rounded text-[12px] font-medium">
                          {kw}
                        </span>
                      ))}
                      {item.metadata.keywords.length > 18 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/10 rounded text-[12px] font-semibold">
                          +{item.metadata.keywords.length - 18} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
