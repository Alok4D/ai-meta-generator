"use client";

import { toast } from "sonner";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { updateCredits } from "@/lib/feature/auth/authSlice";
import { useUploadImageMutation } from "@/lib/feature/upload/uploadApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsSidebar } from "../generator/_components/SettingsSidebar";
import { BatchItemCard } from "./_components/BatchItemCard";
import { BatchUploadSection } from "./_components/BatchUploadSection";
import { UpgradeModal } from "./_components/UpgradeModal";
import { BatchItem } from "./_components/BatchTypes";

export default function BatchUploadPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [uploadImage] = useUploadImageMutation();

  const planName = user?.activePlan?.name?.toLowerCase();
  const isFreePlan = !user?.activePlan || planName === 'free';
  const hasAccess = !isFreePlan;

  let maxBatchSize = 0;
  if (planName === 'lite') maxBatchSize = 50;
  else if (planName === 'pro') maxBatchSize = 100;
  else if (planName === 'max') maxBatchSize = 200;
  else if (planName === 'unlimited') maxBatchSize = Infinity;
  else if (hasAccess) maxBatchSize = 50;

  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Advanced Settings State
  const [platform, setPlatform] = useState('general');
  const [titleLength, setTitleLength] = useState([157]);
  const [descriptionLength, setDescriptionLength] = useState([200]);
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
        if (parsed.descriptionLength) setDescriptionLength([parsed.descriptionLength]);
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
      descriptionLength: descriptionLength[0],
      keywordCount: keywordCount[0],
      usePrefix, prefix,
      useSuffix, suffix,
      useNegativeTitle, negativeTitleWords,
      useNegativeKeywords, negativeKeywords
    };
    localStorage.setItem('metaGenSettings', JSON.stringify(settings));
  }, [platform, titleLength, descriptionLength, keywordCount, usePrefix, prefix, useSuffix, suffix, useNegativeTitle, negativeTitleWords, useNegativeKeywords, negativeKeywords]);

  useEffect(() => {
    let tMax = 200, tMin = 20, kMax = 50, kMin = 5;
    if (platform === 'adobe') { tMax = 200; kMax = 49; kMin = 5; }
    else if (platform === 'shutterstock') { tMax = 2048; kMax = 50; kMin = 7; }
    else if (platform === 'both') { tMax = 200; kMax = 49; kMin = 7; }

    const curTitle = titleLength[0] || 157;
    const curDesc = descriptionLength[0] || 200;
    const curKw = keywordCount[0] || 41;

    if (curTitle > tMax) setTitleLength([tMax]);
    else if (curTitle < tMin) setTitleLength([tMin]);

    if (curDesc > 2048) setDescriptionLength([2048]);
    else if (curDesc < 20) setDescriptionLength([20]);
    
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
  } else if (platform === 'both') {
    maxTitleLength = 200;
    maxKeywords = 49;
    minKeywords = 7;
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isProcessing) {
      toast.error("Please wait until current batch finishes");
      return;
    }

    const currentCount = items.length;
    const remainingSlots = maxBatchSize === Infinity ? Infinity : Math.max(0, maxBatchSize - currentCount);

    if (remainingSlots <= 0) {
      toast.error(`You have reached the maximum limit of ${maxBatchSize} images for your current plan`);
      return;
    }

    let filesToAdd = acceptedFiles;
    if (remainingSlots !== Infinity && acceptedFiles.length > remainingSlots) {
      filesToAdd = acceptedFiles.slice(0, remainingSlots);
      toast.warning(`Added only ${remainingSlots} images to stay within your ${maxBatchSize} image limit.`);
    }

    const newItems: BatchItem[] = filesToAdd.map(file => {
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

    setItems(prev => [...prev, ...newItems]);
    toast.success(`Added ${newItems.length} file(s) to batch`);
  }, [isProcessing, items.length, maxBatchSize]);

  useEffect(() => {
    return () => {
      items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const dropzone = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp', '.avif'],
      'application/postscript': ['.eps']
    },
    noClick: false
  });

  const processSingleItem = async (item: BatchItem, index: number) => {
    setItems(prev => prev.map((p, idx) => idx === index ? { ...p, status: 'processing', error: undefined } : p));

    const formData = new FormData();
    formData.append("image", item.file);
    formData.append("platform", platform);
    formData.append("titleLength", (titleLength[0] || 157).toString());
    formData.append("descriptionLength", (descriptionLength[0] || 200).toString());
    formData.append("keywordCount", (keywordCount[0] || 41).toString());
    if (prefix) formData.append("prefix", prefix);
    if (suffix) formData.append("suffix", suffix);
    if (negativeTitleWords) formData.append("negativeTitleWords", negativeTitleWords);
    if (negativeKeywords) formData.append("negativeKeywords", negativeKeywords);

    try {
      const data = await uploadImage(formData).unwrap();
      dispatch(updateCredits(data.creditsRemaining));
      
      setItems(prev => prev.map((p, idx) => idx === index ? { 
        ...p, 
        status: 'success', 
        metadata: data.metadata 
      } : p));
      return true;
    } catch (error: any) {
      setItems(prev => prev.map((p, idx) => idx === index ? { 
        ...p, 
        status: 'error', 
        error: error.data?.error || "Generation failed" 
      } : p));
      return false;
    }
  };

  const startProcessing = async () => {
    if (items.length === 0) return;
    
    // Check pending and failed items
    const actionableItems = items.filter(i => i.status === 'pending' || i.status === 'error');
    if (actionableItems.length === 0) {
      toast.info("All items have already been processed!");
      return;
    }

    if (!user) return;
    if (actionableItems.length > user.credits) {
      toast.error(`You need ${actionableItems.length} credits but only have ${user.credits}`);
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;

    for (let i = 0; i < items.length; i++) {
      if (!isProcessingRef.current) break;
      
      const item = items[i];
      if (!item) continue;
      if (item.status === 'success') continue;

      await processSingleItem(item, i);
    }

    setIsProcessing(false);
    isProcessingRef.current = false;
    toast.success("Batch processing finished!");
  };

  const handleRetrySingle = async (id: string) => {
    if (isProcessing) {
      toast.error("Please wait for current process to complete");
      return;
    }

    if (!user || user.credits < 1) {
      toast.error("Not enough credits to retry");
      return;
    }

    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) return;

    const item = items[itemIndex];
    if (!item) return;

    setIsProcessing(true);
    isProcessingRef.current = true;

    const success = await processSingleItem(item, itemIndex);
    if (success) {
      toast.success("Metadata regenerated successfully!");
    } else {
      toast.error("Retry failed. Please check server logs.");
    }

    setIsProcessing(false);
    isProcessingRef.current = false;
  };

  const handleRetryAllFailed = async () => {
    if (isProcessing) return;
    const failedItems = items.filter(i => i.status === 'error');
    if (failedItems.length === 0) return;

    if (!user || user.credits < failedItems.length) {
      toast.error(`You need ${failedItems.length} credits but only have ${user?.credits || 0}`);
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;

    for (let i = 0; i < items.length; i++) {
      if (!isProcessingRef.current) break;
      const item = items[i];
      if (!item || item.status !== 'error') continue;

      await processSingleItem(item, i);
    }

    setIsProcessing(false);
    isProcessingRef.current = false;
    toast.success("Retry completed!");
  };

  const handleStopProcessing = () => {
    Swal.fire({
      title: 'Halt Batch Processing?',
      text: "Are you sure you want to interrupt the current batch? Any pending items will remain in the queue, but you will need to restart the process manually to finish them.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, stop processing',
      cancelButtonText: 'Continue processing'
    }).then((result) => {
      if (result.isConfirmed) {
        isProcessingRef.current = false; 
        setIsProcessing(false); 
        toast.info("Batch processing was halted by the user.");
      }
    });
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

  const successfulCount = items.filter(i => i.status === 'success').length;
  const failedCount = items.filter(i => i.status === 'error').length;
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const completedCount = successfulCount + failedCount;
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
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{completedCount}/{totalCount} Processed</span>
          {successfulCount > 0 && <span className="text-green-600 font-medium">✓ {successfulCount} Completed</span>}
          {failedCount > 0 && <span className="text-red-500 font-medium">✕ {failedCount} Failed</span>}
          {pendingCount > 0 && <span className="text-muted-foreground">⏳ {pendingCount} Pending</span>}
        </div>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-h-0 overflow-hidden">
      {/* Top Header - Fixed at top */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 pb-3 border-b border-border/50">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Batch Upload</h2>
          <p className="text-muted-foreground text-sm">Upload and process multiple images at once.</p>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {!isProcessing && (
              <Button 
                variant="outline" 
                onClick={() => dropzone.open()} 
                className="flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Add More Files
              </Button>
            )}
            {!isProcessing && (pendingCount > 0 || failedCount > 0) && (
              <Button onClick={startProcessing}>
                {failedCount > 0 && pendingCount === 0 ? 'Process Remaining' : 'Start Processing'}
              </Button>
            )}
            {!isProcessing && failedCount > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleRetryAllFailed}
                className="flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Retry Failed ({failedCount})
              </Button>
            )}
            {isProcessing && (
              <Button variant="secondary" onClick={handleStopProcessing}>Stop Processing</Button>
            )}
            <Button variant="outline" onClick={() => setItems([])} disabled={isProcessing}>Clear All</Button>
            {successfulCount > 0 && (
               <Button variant="secondary" onClick={handleDownloadAllCSV}>Download All CSV</Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content: Left Fixed Sidebar + Right Independent Scrollable List */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden items-stretch">
        {/* Left Sidebar - Stays fixed on left with internal scroll if needed */}
        <div className="w-full lg:w-80 shrink-0 lg:h-full lg:overflow-y-auto overscroll-contain pr-1">
          <SettingsSidebar 
            platform={platform} setPlatform={setPlatform}
            titleLength={titleLength} setTitleLength={setTitleLength} maxTitleLength={maxTitleLength} minTitleLength={minTitleLength}
            descriptionLength={descriptionLength} setDescriptionLength={setDescriptionLength}
            keywordCount={keywordCount} setKeywordCount={setKeywordCount} maxKeywords={maxKeywords} minKeywords={minKeywords}
            prefix={prefix} setPrefix={setPrefix}
            suffix={suffix} setSuffix={setSuffix}
            negativeTitleWords={negativeTitleWords} setNegativeTitleWords={setNegativeTitleWords}
            negativeKeywords={negativeKeywords} setNegativeKeywords={setNegativeKeywords}
          />
        </div>

        {/* Right Area: Progress Bar + Independent Scrollable Items List */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col space-y-3 h-full overflow-hidden">
          {items.length > 0 && (
            <div className="shrink-0">{renderProgressBar()}</div>
          )}

          {items.length === 0 ? (
            <div className="flex-1 min-h-0 h-full">
              <BatchUploadSection 
                hasAccess={hasAccess} 
                onUpgradeClick={() => setShowUpgradeModal(true)} 
                dropzone={dropzone} 
                maxBatchSize={maxBatchSize}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 space-y-4 pb-6">
              {items.map((item) => (
                <BatchItemCard 
                  key={item.id} 
                  item={item} 
                  isProcessing={isProcessing} 
                  onRemove={(id) => setItems(prev => prev.filter(i => i.id !== id))} 
                  onRetry={handleRetrySingle}
                />
              ))}

              {/* Bottom Drag & Drop Add More Files Area */}
              {!isProcessing && (
                <div 
                  {...dropzone.getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-muted/40 ${
                    dropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/10'
                  }`}
                >
                  <input {...dropzone.getInputProps()} />
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 5v14M5 12h14"/></svg>
                      <span className="text-sm font-medium text-foreground">Drag & Drop or Click to add more files to this batch</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({items.length}/{maxBatchSize === Infinity ? '∞' : maxBatchSize} files)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
