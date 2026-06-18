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

  const dropzone = useDropzone({ 
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
            <BatchUploadSection 
              hasAccess={hasAccess} 
              onUpgradeClick={() => setShowUpgradeModal(true)} 
              dropzone={dropzone} 
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <BatchItemCard 
                  key={item.id} 
                  item={item} 
                  isProcessing={isProcessing} 
                  onRemove={(id) => setItems(prev => prev.filter(i => i.id !== id))} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
