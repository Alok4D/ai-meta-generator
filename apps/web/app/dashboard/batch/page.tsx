"use client";

import { toast } from "sonner";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { updateCredits } from "@/lib/feature/auth/authSlice";
import { useUploadImageMutation } from "@/lib/feature/upload/uploadApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsSidebar } from "../generator/_components/SettingsSidebar";

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [uploadImage] = useUploadImageMutation();

  const planName = user?.activePlan?.name?.toLowerCase();
  const hasAccess = planName === 'pro' || planName === 'agency';

  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Advanced Settings State
  const [platform, setPlatform] = useState('general');
  const [titleLength, setTitleLength] = useState([157]);
  const [keywordCount, setKeywordCount] = useState([41]);
  const [usePrefix, setUsePrefix] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [useSuffix, setUseSuffix] = useState(false);
  const [suffix, setSuffix] = useState('');
  const [useNegativeTitle, setUseNegativeTitle] = useState(false);
  const [negativeTitleWords, setNegativeTitleWords] = useState('');
  const [useNegativeKeywords, setUseNegativeKeywords] = useState(false);
  const [negativeKeywords, setNegativeKeywords] = useState('');

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('metaGenSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.titleLength) setTitleLength([parsed.titleLength]);
        if (parsed.keywordCount) setKeywordCount([parsed.keywordCount]);
        if (parsed.usePrefix !== undefined) setUsePrefix(parsed.usePrefix);
        if (parsed.prefix) setPrefix(parsed.prefix);
        if (parsed.useSuffix !== undefined) setUseSuffix(parsed.useSuffix);
        if (parsed.suffix) setSuffix(parsed.suffix);
        if (parsed.useNegativeTitle !== undefined) setUseNegativeTitle(parsed.useNegativeTitle);
        if (parsed.negativeTitleWords) setNegativeTitleWords(parsed.negativeTitleWords);
        if (parsed.useNegativeKeywords !== undefined) setUseNegativeKeywords(parsed.useNegativeKeywords);
        if (parsed.negativeKeywords) setNegativeKeywords(parsed.negativeKeywords);
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      platform,
      titleLength: titleLength[0],
      keywordCount: keywordCount[0],
      usePrefix, prefix,
      useSuffix, suffix,
      useNegativeTitle, negativeTitleWords,
      useNegativeKeywords, negativeKeywords
    };
    localStorage.setItem('metaGenSettings', JSON.stringify(settings));
  }, [platform, titleLength, keywordCount, usePrefix, prefix, useSuffix, suffix, useNegativeTitle, negativeTitleWords, useNegativeKeywords, negativeKeywords]);

  useEffect(() => {
    let tMax = 200, tMin = 20, kMax = 50, kMin = 5;
    if (platform === 'adobe') { tMax = 200; kMax = 49; kMin = 5; }
    else if (platform === 'shutterstock') { tMax = 2048; kMax = 50; kMin = 7; }

    const curTitle = titleLength[0] || 157;
    const curKw = keywordCount[0] || 41;

    if (curTitle > tMax) setTitleLength([tMax]);
    else if (curTitle < tMin) setTitleLength([tMin]);
    
    if (curKw > kMax) setKeywordCount([kMax]);
    else if (curKw < kMin) setKeywordCount([kMin]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  let maxTitleLength = 200;
  let minTitleLength = 20;
  let maxKeywords = 50;
  let minKeywords = 5;

  if (platform === 'adobe') {
    maxTitleLength = 200;
    maxKeywords = 49;
    minKeywords = 5;
  } else if (platform === 'shutterstock') {
    maxTitleLength = 2048;
    maxKeywords = 50;
    minKeywords = 7;
  }

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
    if (!user) return;
    if (pendingCount > user.credits) {
      toast.error(`You need ${pendingCount} credits but only have ${user.credits}`);
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;

    for (let i = 0; i < items.length; i++) {
      if (!isProcessingRef.current) break;
      
      const item = items[i];
      if (!item) continue;
      if (item.status === 'success') continue;

      setItems(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'processing' } : p));

      const formData = new FormData();
      formData.append("image", item.file);
      formData.append("platform", platform);
      formData.append("titleLength", (titleLength[0] || 157).toString());
      formData.append("keywordCount", (keywordCount[0] || 41).toString());
      if (prefix) formData.append("prefix", prefix);
      if (suffix) formData.append("suffix", suffix);
      if (negativeTitleWords) formData.append("negativeTitleWords", negativeTitleWords);
      if (negativeKeywords) formData.append("negativeKeywords", negativeKeywords);

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
      const mainText = item.metadata.platform === 'shutterstock' ? item.metadata.description : item.metadata.title;
      const safeTitle = mainText ? mainText.replace(/"/g, '""') : '';
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full mx-auto">
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <SettingsSidebar 
          platform={platform} setPlatform={setPlatform}
          titleLength={titleLength} setTitleLength={setTitleLength} maxTitleLength={maxTitleLength} minTitleLength={minTitleLength}
          keywordCount={keywordCount} setKeywordCount={setKeywordCount} maxKeywords={maxKeywords} minKeywords={minKeywords}
          prefix={prefix} setPrefix={setPrefix}
          suffix={suffix} setSuffix={setSuffix}
          negativeTitleWords={negativeTitleWords} setNegativeTitleWords={setNegativeTitleWords}
          negativeKeywords={negativeKeywords} setNegativeKeywords={setNegativeKeywords}
        />

        {/* Right Area: Batch Processing UI */}
        <div className="flex-1 space-y-6 min-w-0">
          {items.length > 0 && renderProgressBar()}

          {items.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/5">
          <CardContent className="flex flex-col items-center justify-center h-80 text-center space-y-4 p-6">
            {!hasAccess ? (
              <div 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors hover:bg-muted/50"
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <div className="space-y-2 max-w-sm text-center">
                  <h3 className="font-semibold text-xl">Drag & Drop up to 50 images</h3>
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
                  <h3 className="font-semibold text-xl">Drag & Drop up to 50 images</h3>
                  <p className="text-sm text-muted-foreground">JPG, PNG, SVG, WEBP, AVIF or EPS</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id} className={`overflow-hidden border-border/40 shadow-sm transition-all duration-300 ${item.status === 'processing' ? 'border-primary/50 ring-1 ring-primary/20 shadow-md' : ''}`}>
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
                      // Add a small delay so it doesn't snap back instantly while scaling down
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
                          onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
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
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>
            <DialogTitle className="text-center text-xl font-bold">Unlock Batch Processing</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Pro and Agency plans include Batch Processing, allowing you to upload up to <strong className="text-foreground">50 images at once</strong> for rapid metadata generation and conversion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
              <span>Batch Upload — up to 50 images at once</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              <span>Image Converter & Metadata Extractor</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>EPS Support & Vector Conversion</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
            <Button className="w-full text-md py-6 rounded-xl" onClick={() => router.push("/dashboard/pricing")}>
              Upgrade plan
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setShowUpgradeModal(false)}>
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
