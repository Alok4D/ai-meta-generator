"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateCredits } from "@/store/authSlice";
import { useUploadImageMutation } from "@/store/apiSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setMetadata(null); // clear previous
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp']
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
      setFile(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Upload failed");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Upload an image to generate SEO metadata.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.credits}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-dashed border-2 bg-muted/10 h-full">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-64 text-center space-y-4 p-6">
            <div 
              {...getRootProps()} 
              className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors ${isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}`}
            >
              <input {...getInputProps()} />
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">
                  {file ? file.name : "Click to upload or drag and drop"}
                </h3>
                <p className="text-sm text-muted-foreground">SVG, PNG, JPG or WEBP (max. 10MB)</p>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              disabled={!file || uploading} 
              onClick={handleUpload}
            >
              {uploading ? "Analyzing Image..." : "Generate Metadata"}
            </Button>
          </CardContent>
        </Card>

        {/* Results View */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Generated Metadata</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {metadata ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Title</h4>
                  <div className="p-3 bg-muted rounded-md text-sm">{metadata.title}</div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Category</h4>
                  <div className="p-3 bg-muted rounded-md text-sm capitalize">{metadata.category}</div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Keywords ({metadata.keywords.length})</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {metadata.keywords.map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText(metadata.keywords.join(', '))}>
                  Copy All Keywords
                </Button>
              </div>
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
