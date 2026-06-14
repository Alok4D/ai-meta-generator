"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { updateCredits } from "@/lib/feature/auth/authSlice";
import { useUploadImageMutation, useRegenerateMetadataMutation } from "@/lib/feature/upload/uploadApi";
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Settings, Download, Trash2, Wand2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

import { SettingsSidebar } from "./_components/SettingsSidebar";
import { UploadSection } from "./_components/UploadSection";
import { GeneratedResults } from "./_components/GeneratedResults";

export default function Dashboard() {
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  
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

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();
  const [regenerateMetadata, { isLoading: isRegenerating }] = useRegenerateMetadataMutation();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]!;
      setFile(selectedFile);
      setMetadata(null);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      if (selectedFile.type.startsWith("image/")) {
        const img = new window.Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = objectUrl;
      } else {
        setImageDimensions({ width: 0, height: 0 });
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/svg+xml": [],
      "image/webp": [],
      "image/avif": [],
      "application/postscript": [".eps"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    if (user && user.credits <= 0) {
      const result = await Swal.fire({
        title: 'Credits Empty!',
        text: "You don't have enough credits to generate metadata.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Buy Credits'
      });
      if (result.isConfirmed) {
        router.push("/dashboard/pricing");
      }
      return;
    }
    
    const formData = new FormData();
    formData.append("image", file);
    formData.append("platform", platform);
    formData.append("titleLength", (titleLength[0] || 157).toString());
    formData.append("keywordCount", (keywordCount[0] || 41).toString());
    if (prefix) formData.append("prefix", prefix);
    if (suffix) formData.append("suffix", suffix);
    if (negativeTitleWords) formData.append("negativeTitleWords", negativeTitleWords);
    if (negativeKeywords) formData.append("negativeKeywords", negativeKeywords);

    try {
      const data = await uploadImage(formData).unwrap();
      
      toast.success("Metadata generated successfully!");
      setMetadata(data.metadata);
      dispatch(updateCredits(data.creditsRemaining));
    } catch (error: any) {
      toast.error(error.data?.error || "Upload failed");
    }
  };

  const handleRegenerate = async () => {
    if (!metadata || !metadata.imageUrl) {
      toast.error("No image found to regenerate");
      return;
    }

    if (user && user.credits < 2) {
      toast.error("Not enough credits. Regenerating costs 2 credits.");
      return;
    }

    const result = await Swal.fire({
      title: 'Regenerate Metadata?',
      text: "This action will cost 2 credits from your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, regenerate!'
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          imageUrl: metadata.imageUrl,
          platform,
          titleLength: titleLength[0] || 157,
          keywordCount: keywordCount[0] || 41,
          prefix: prefix || '',
          suffix: suffix || '',
          negativeTitleWords: negativeTitleWords || '',
          negativeKeywords: negativeKeywords || ''
        };
        const data = await regenerateMetadata(payload).unwrap();
        toast.success("Metadata regenerated successfully!");
        setMetadata(data.metadata);
        dispatch(updateCredits(data.creditsRemaining));
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to regenerate metadata");
      }
    }
  };

  const handleDownloadTXT = () => {
    if (!metadata) return;
    const labelText = metadata.platform === 'shutterstock' ? 'Description' : 'Title';
    const mainText = metadata.platform === 'shutterstock' ? metadata.description : metadata.title;
    const content = `${labelText}:\n${mainText}\n\nCategory:\n${metadata.category}\n\nKeywords:\n${metadata.keywords.join(", ")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.split('.')[0] || 'metadata'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!metadata) return;
    const filename = file?.name || 'image.jpg';
    const mainText = metadata.platform === 'shutterstock' ? metadata.description : metadata.title;
    const safeTitle = mainText ? mainText.replace(/"/g, '""') : '';
    const safeKeywords = metadata.keywords ? metadata.keywords.join(",").replace(/"/g, '""') : '';
    const labelText = metadata.platform === 'shutterstock' ? 'Description' : 'Title';
    const csvContent = `Filename,${labelText},Keywords,Category\n"${filename}","${safeTitle}","${safeKeywords}","${metadata.category}"`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.split('.')[0] || 'metadata'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string | undefined, label: string) => {
    if (!text) {
      toast.error(`Nothing to copy for ${label}`);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error(`Failed to copy ${label}`);
    });
  };

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

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Upload an image to generate SEO metadata.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsSidebar 
          platform={platform} setPlatform={setPlatform}
          titleLength={titleLength} setTitleLength={setTitleLength} maxTitleLength={maxTitleLength} minTitleLength={minTitleLength}
          keywordCount={keywordCount} setKeywordCount={setKeywordCount} maxKeywords={maxKeywords} minKeywords={minKeywords}
          prefix={prefix} setPrefix={setPrefix}
          suffix={suffix} setSuffix={setSuffix}
          negativeTitleWords={negativeTitleWords} setNegativeTitleWords={setNegativeTitleWords}
          negativeKeywords={negativeKeywords} setNegativeKeywords={setNegativeKeywords}
        />

        <div className="flex-1 flex flex-col gap-6">
          <UploadSection 
            file={file} setFile={setFile}
            previewUrl={previewUrl} setPreviewUrl={setPreviewUrl}
            imageDimensions={imageDimensions} setImageDimensions={setImageDimensions}
            metadata={metadata} setMetadata={setMetadata}
            uploading={uploading} handleUpload={handleUpload}
            dropzone={{ getRootProps, getInputProps, isDragActive } as any}
          />
          
          <GeneratedResults 
            metadata={metadata}
            handleDownloadTXT={handleDownloadTXT}
            handleDownloadCSV={handleDownloadCSV}
            handleCopy={handleCopy}
            handleRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>
    </div>
  );
}
