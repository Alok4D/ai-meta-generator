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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]!;
      setFile(selectedFile);
      setMetadata(null);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Get image dimensions (skip for EPS as browsers can't render it in Image)
      const isEps = selectedFile.type === 'application/postscript' || selectedFile.name.toLowerCase().endsWith('.eps');
      if (!isEps) {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = objectUrl;
      } else {
        setImageDimensions({ width: 0, height: 0 });
      }
    }
  }, []);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp', '.avif'],
      'application/postscript': ['.eps']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;
    if (!user) return;
    
    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await uploadImage(formData).unwrap();
      
      toast.success("Metadata generated successfully!");
      setMetadata(data.metadata);
      dispatch(updateCredits(data.creditsRemaining));
      // Do not clear the file so the preview remains visible
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
        const data = await regenerateMetadata({ imageUrl: metadata.imageUrl }).unwrap();
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
    
    const content = `Title:\n${metadata.title}\n\nCategory:\n${metadata.category}\n\nKeywords:\n${metadata.keywords.join(", ")}`;
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
    
    // Format for typical stock sites: Filename, Description, Keywords, Categories
    const filename = file?.name || 'image.jpg';
    // Escape double quotes inside title by doubling them
    const safeTitle = metadata.title.replace(/"/g, '""');
    const safeKeywords = metadata.keywords.join(",").replace(/"/g, '""');
    
    const csvContent = `Filename,Title,Keywords,Category\n"${filename}","${safeTitle}","${safeKeywords}","${metadata.category}"`;
    
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

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Upload an image to generate SEO metadata.</p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-dashed border-2 bg-muted/10 h-full relative overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
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
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center group">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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
                    ) : "Generate Metadata"}
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
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Metadata</CardTitle>
            {metadata && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTXT}>Download TXT</Button>
                <Button variant="outline" size="sm" onClick={handleDownloadCSV}>Download CSV</Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            {metadata ? (
              <Tabs defaultValue="adobe" className="w-full flex-col">
                {/* <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="adobe">Adobe Stock</TabsTrigger>
                  <TabsTrigger value="shutterstock">Shutterstock</TabsTrigger>
                  <TabsTrigger value="seo">SEO Mode</TabsTrigger>
                </TabsList> */}
                
                <TabsContent value="adobe" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">Title</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigator.clipboard.writeText(metadata.title)}>Copy</Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md text-sm">{metadata.title}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Category</h4>
                    <div className="p-3 bg-muted rounded-md text-sm capitalize">{metadata.category}</div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">Keywords ({metadata.keywords?.length || 49})</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigator.clipboard.writeText(metadata.keywords.join(', '))}>Copy</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metadata.keywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Regenerating...
                      </div>
                    ) : "Regenerate"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="shutterstock" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">Title</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigator.clipboard.writeText(metadata.title)}>Copy</Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md text-sm">{metadata.title}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Description</h4>
                    <div className="p-3 bg-muted rounded-md text-sm">{metadata.title} - A high quality image perfect for your projects.</div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">Keywords</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigator.clipboard.writeText(metadata.keywords.join(', '))}>Copy</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metadata.keywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">SEO Title</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigator.clipboard.writeText(metadata.title)}>Copy</Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md text-sm">{metadata.title}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">SEO Description</h4>
                    <div className="p-3 bg-muted rounded-md text-sm">Download this amazing image of {metadata.title}. Perfect for web design, marketing, and commercial use.</div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">Tags</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => navigator.clipboard.writeText(metadata.keywords.slice(0, 15).join(', '))}>Copy</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metadata.keywords.slice(0, 15).map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                <p>Upload an image to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
