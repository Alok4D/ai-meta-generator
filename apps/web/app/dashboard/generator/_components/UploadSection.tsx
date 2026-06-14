"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Wand2 } from "lucide-react";
import { DropzoneState } from "react-dropzone";

interface UploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  imageDimensions: { width: number, height: number } | null;
  setImageDimensions: (dims: { width: number, height: number } | null) => void;
  metadata: any;
  setMetadata: (meta: any) => void;
  uploading: boolean;
  handleUpload: () => void;
  dropzone: DropzoneState;
}

export function UploadSection({
  file, setFile,
  previewUrl, setPreviewUrl,
  imageDimensions, setImageDimensions,
  metadata, setMetadata,
  uploading, handleUpload,
  dropzone
}: UploadSectionProps) {
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
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
  );
}
