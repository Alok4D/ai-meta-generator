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
        {/* Left Sidebar: Metadata Settings */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Card className="shadow-sm border-muted/60">
            <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Metadata Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {/* Export Platform */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Export Platform</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'general', label: 'General', icon: <Sparkles className="w-3.5 h-3.5"/> },
                    { id: 'adobe', label: 'Adobe Stock' },
                    { id: 'shutterstock', label: 'Shutterstock' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
                        platform === p.id 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-background text-foreground hover:bg-muted/60'
                      }`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16"/><path d="M4 15h16"/></svg>
                      {platform === 'shutterstock' ? 'Description Length' : 'Title Length'}
                    </Label>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{titleLength[0] || 157} chars</span>
                  </div>
                  <Slider 
                    value={titleLength} 
                    onValueChange={(val: any) => setTitleLength(Array.isArray(val) ? val : [val])} 
                    max={maxTitleLength} 
                    min={minTitleLength} 
                    step={1}
                    className="cursor-pointer"
                  />
                  {platform === 'shutterstock' && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Minimum 5 words - 0/2048)</p>
                  )}
                  {platform === 'adobe' && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Max: 200 characters)</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h14"/><path d="M7 4h14"/><path d="M3 4h.01"/><path d="M3 12h.01"/><path d="M3 20h.01"/><path d="M7 12h14"/></svg>
                      Keywords Count
                    </Label>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{keywordCount[0] || 41} words</span>
                  </div>
                  <Slider 
                    value={keywordCount} 
                    onValueChange={(val: any) => setKeywordCount(Array.isArray(val) ? val : [val])} 
                    max={maxKeywords} 
                    min={minKeywords} 
                    step={1}
                    className="cursor-pointer"
                  />
                  {platform === 'shutterstock' && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Minimum 7 unique keywords 0/50)</p>
                  )}
                  {platform === 'adobe' && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Min: 5 - Max: 49 keywords)</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 pt-2 border-t border-muted/50">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Options</Label>
                
                <div className="space-y-1.5">
                  <Label htmlFor="prefix-input" className="text-sm font-medium">Prefix</Label>
                  <Input 
                    id="prefix-input"
                    placeholder="e.g. Stock Photo - (Optional)" 
                    className="h-8 text-sm" 
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="suffix-input" className="text-sm font-medium">Suffix</Label>
                  <Input 
                    id="suffix-input"
                    placeholder="e.g. - HD Quality (Optional)" 
                    className="h-8 text-sm" 
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="neg-title-input" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                    Negative Title Words
                  </Label>
                  <Input 
                    id="neg-title-input"
                    placeholder="e.g. free, cheap, best (Optional)" 
                    className="h-8 text-sm" 
                    value={negativeTitleWords}
                    onChange={(e) => setNegativeTitleWords(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="neg-keywords-input" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                    Negative Keywords
                  </Label>
                  <Input 
                    id="neg-keywords-input"
                    placeholder="e.g. cartoon, anime (Optional)" 
                    className="h-8 text-sm" 
                    value={negativeKeywords}
                    onChange={(e) => setNegativeKeywords(e.target.value)}
                  />
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>

        {/* Right Area: Upload and Results */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="border-dashed border-2 bg-muted/10 relative overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors ${isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}`}
                >
                  <input {...getInputProps()} />
                  <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
                    <p className="text-sm text-muted-foreground">JPG, PNG, SVG, WEBP, AVIF or EPS (max. 10MB)</p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-between h-full space-y-4">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center group max-h-[400px]">
                    {metadata && metadata.imageUrl ? (
                      <img src={metadata.imageUrl} alt="Generated Preview" className="max-w-full max-h-full object-contain" />
                    ) : (file.type === 'application/postscript' || file.name.toLowerCase().endsWith('.eps')) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-muted/10">
                        <div className="p-4 bg-primary/10 rounded-full text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">EPS File</p>
                          <p className="text-sm text-muted-foreground mt-1">Preview unavailable</p>
                          <p className="text-xs text-muted-foreground mt-1">Will be processed by AI after upload</p>
                        </div>
                      </div>
                    ) : (
                      previewUrl && <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    )}
                    <button 
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setImageDimensions(null);
                        setMetadata(null);
                      }}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="w-full grid grid-cols-2 gap-4 text-left text-sm p-4 bg-muted/50 rounded-lg">
                    <div className="col-span-2 flex justify-between items-center border-b pb-2">
                      <span className="font-medium text-foreground truncate mr-2">{file.name}</span>
                      <span className="text-muted-foreground whitespace-nowrap">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Type</span>
                      <span className="font-medium mt-0.5">{file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Dimensions</span>
                      <span className="font-medium mt-0.5">
                        {imageDimensions 
                          ? (imageDimensions.width === 0 && imageDimensions.height === 0 ? 'Vector Graphic' : `${imageDimensions.width} x ${imageDimensions.height}`) 
                          : 'Calculating...'}
                      </span>
                    </div>
                  </div>

                  {!metadata ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={uploading} 
                      onClick={handleUpload}
                    >
                      {uploading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Analyzing Image with AI...
                        </div>
                      ) : <><Wand2 className="w-4 h-4 mr-2" /> Generate Metadata</>}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setImageDimensions(null);
                        setMetadata(null);
                      }}
                    >
                      Upload New Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results View */}
          <Card className="flex-1 border-muted/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle className="text-xl">Generated Metadata</CardTitle>
              {metadata && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadTXT}><Download className="w-3 h-3 mr-1"/> TXT</Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadCSV}><Download className="w-3 h-3 mr-1"/> CSV</Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {metadata ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-md font-medium text-muted-foreground">{metadata.platform === 'shutterstock' ? 'Description' : 'Title'}</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleCopy(metadata.platform === 'shutterstock' ? metadata.description : metadata.title, metadata.platform === 'shutterstock' ? 'Description' : 'Title')}>Copy</Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md text-sm leading-relaxed">{metadata.platform === 'shutterstock' ? metadata.description : metadata.title}</div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-muted-foreground mb-1">Category</h4>
                    <div className="p-3 bg-muted rounded-md text-sm capitalize">{metadata.category}</div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-md font-medium text-muted-foreground">Keywords ({metadata.keywords?.length || 49})</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleCopy(metadata.keywords?.join(', '), 'Keywords')}>Copy</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/30 rounded-md border">
                      {metadata.keywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-background text-foreground border rounded-md text-sm font-medium shadow-sm capitalize">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full mt-4"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Regenerating...
                      </div>
                    ) : <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Output</>}
                  </Button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                  <p>Results will appear here after generation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
