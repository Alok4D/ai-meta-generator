"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { updateCredits } from "@/lib/feature/auth/authSlice";
import { useUploadImageMutation } from "@/lib/feature/upload/uploadApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BatchItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  metadata?: any;
  error?: string;
  size?: number;
  dimensions?: { width: number, height: number } | null;
};

export default function BatchUploadPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadImage] = useUploadImageMutation();

  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isProcessing) {
      toast.error("Please wait until current batch finishes");
      return;
    }
    
    if (acceptedFiles.length > 50) {
      toast.error("You can only upload up to 50 images at once");
      return;
    }

    const newItems: BatchItem[] = acceptedFiles.map(file => {
      const isEps = file.type === 'application/postscript' || file.name.toLowerCase().endsWith('.eps');
      const objectUrl = URL.createObjectURL(file);
      
      const item: BatchItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: objectUrl,
        status: 'pending',
        size: file.size,
        dimensions: isEps ? { width: 0, height: 0 } : null
      };

      if (!isEps) {
        const img = new Image();
        img.onload = () => {
          setItems(prev => prev.map(p => p.id === item.id ? { ...p, dimensions: { width: img.width, height: img.height } } : p));
        };
        img.src = objectUrl;
      }

      return item;
    });

    setItems(newItems);
  }, [isProcessing]);

  useEffect(() => {
    return () => {
      items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp', '.avif'],
      'application/postscript': ['.eps']
    },
    maxFiles: 50
  });

  const startProcessing = async () => {
    if (items.length === 0) return;
    
    // Check pending count against credits
    const pendingCount = items.filter(i => i.status === 'pending' || i.status === 'error').length;
    if (pendingCount > user.credits) {
      toast.error(`You need ${pendingCount} credits but only have ${user.credits}`);
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;

    for (let i = 0; i < items.length; i++) {
      if (!isProcessingRef.current) break;
      
      const item = items[i];
      if (item.status === 'success') continue;

      setItems(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'processing' } : p));

      const formData = new FormData();
      formData.append("image", item.file);

      try {
        const data = await uploadImage(formData).unwrap();
        dispatch(updateCredits(data.creditsRemaining));
        
        setItems(prev => prev.map((p, idx) => idx === i ? { 
          ...p, 
          status: 'success', 
          metadata: data.metadata 
        } : p));
      } catch (error: any) {
        setItems(prev => prev.map((p, idx) => idx === i ? { 
          ...p, 
          status: 'error', 
          error: error.data?.error || "Failed" 
        } : p));
      }
    }

    setIsProcessing(false);
    isProcessingRef.current = false;
    if (isProcessingRef.current !== false) {
       toast.success("Batch processing complete!");
    }
  };

  const handleDownloadAllCSV = () => {
    const successfulItems = items.filter(item => item.status === 'success' && item.metadata);
    if (successfulItems.length === 0) return;

    let csvContent = `Filename,Title,Keywords,Category\n`;
    
    successfulItems.forEach(item => {
      const safeTitle = item.metadata.title.replace(/"/g, '""');
      const safeKeywords = item.metadata.keywords.join(",").replace(/"/g, '""');
      csvContent += `"${item.file.name}","${safeTitle}","${safeKeywords}","${item.metadata.category}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-metadata-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedCount = items.filter(i => i.status === 'success' || i.status === 'error').length;
  const totalCount = items.length;

  const renderProgressBar = () => {
    if (totalCount === 0) return null;
    const percentage = Math.round((completedCount / totalCount) * 100);
    const totalBlocks = 20;
    const filledBlocks = Math.round((completedCount / totalCount) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    
    const filledStr = '█'.repeat(filledBlocks);
    const emptyStr = '░'.repeat(emptyBlocks);
    
    return (
      <div className="font-mono text-sm space-y-2 bg-muted/30 p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-base">
          <span className="font-semibold">Progress:</span>
          <div className="whitespace-nowrap flex items-center">
            <span className="tracking-[0.1em] text-primary">{filledStr}</span>
            <span className="tracking-[0.1em] text-muted-foreground/30">{emptyStr}</span>
          </div>
          <span className="font-semibold ml-auto sm:ml-0">{percentage}%</span>
        </div>
        <div className="text-muted-foreground">{completedCount}/{totalCount} Completed</div>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Batch Upload</h2>
          <p className="text-muted-foreground">Upload and process multiple images at once.</p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            {!isProcessing && completedCount < totalCount && (
              <Button onClick={startProcessing}>Start Processing</Button>
            )}
            {isProcessing && (
              <Button variant="secondary" onClick={() => { isProcessingRef.current = false; setIsProcessing(false); toast.info("Processing stopped"); }}>Stop Processing</Button>
            )}
            <Button variant="outline" onClick={() => setItems([])} disabled={isProcessing}>Clear All</Button>
            {completedCount > 0 && (
               <Button variant="secondary" onClick={handleDownloadAllCSV}>Download All CSV</Button>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && renderProgressBar()}

      {items.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/5">
          <CardContent className="flex flex-col items-center justify-center h-80 text-center space-y-4 p-6">
            <div 
              {...getRootProps()} 
              className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors ${isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}`}
            >
              <input {...getInputProps()} />
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-semibold text-xl">Drag & Drop up to 50 images</h3>
                <p className="text-sm text-muted-foreground">JPG, PNG, SVG, WEBP, AVIF or EPS</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id} className={`overflow-hidden border-border/40 shadow-sm transition-all duration-300 ${item.status === 'processing' ? 'border-primary/50 ring-1 ring-primary/20 shadow-md' : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div 
                  className="w-full md:w-64 bg-muted relative flex-shrink-0 flex items-center justify-center min-h-[14rem] overflow-hidden group cursor-zoom-in"
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
                      // Add a small delay so it doesn't snap back instantly while scaling down
                      setTimeout(() => { img.style.transformOrigin = 'center center'; }, 300);
                    }
                  }}
                >
                  {item.metadata?.imageUrl ? (
                    <img src={item.metadata.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[2]" />
                  ) : (item.file.type === 'application/postscript' || item.file.name.toLowerCase().endsWith('.eps')) ? (
                    <div className="text-center p-4 relative z-10 w-full h-full flex flex-col items-center justify-center">
                      <svg className="mx-auto text-primary opacity-50 mb-2 transition-transform duration-300 ease-out group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg>
                      <p className="text-xs font-medium text-muted-foreground">EPS File</p>
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
                    
                    <div className="flex-shrink-0">
                      {item.status === 'success' && <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-md text-xs font-medium border border-green-500/20">Complete</span>}
                      {item.status === 'pending' && <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium border">Pending</span>}
                      {item.status === 'error' && <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded-md text-xs font-medium border border-red-500/20">Failed</span>}
                      {item.status === 'processing' && <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 flex items-center gap-1.5"><svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing</span>}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    {(item.status === 'pending' || item.status === 'processing') && (
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
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Title</span>
                            <button onClick={() => { navigator.clipboard.writeText(item.metadata.title); toast.success("Copied!"); }} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                              Copy
                            </button>
                          </div>
                          <p className="text-sm font-medium leading-snug">{item.metadata.title}</p>
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
                                <span key={i} className="px-2 py-1 bg-background border shadow-sm text-foreground rounded text-[11px] font-medium">
                                  {kw}
                                </span>
                              ))}
                              {item.metadata.keywords.length > 18 && (
                                <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/10 rounded text-[11px] font-semibold">
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
          ))}
        </div>
      )}
    </div>
  );
}
