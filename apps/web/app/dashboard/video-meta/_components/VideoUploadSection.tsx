"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Wand2, Video as VideoIcon, Film, Play, Clock, Sparkles } from "lucide-react";
import { DropzoneState } from "react-dropzone";

interface VideoUploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  videoDetails: { duration: number; width: number; height: number; resolution: string } | null;
  setVideoDetails: (details: { duration: number; width: number; height: number; resolution: string } | null) => void;
  metadata: any;
  setMetadata: (meta: any) => void;
  uploading: boolean;
  handleUpload: () => void;
  dropzone: DropzoneState;
}

export function VideoUploadSection({
  file, setFile,
  previewUrl, setPreviewUrl,
  videoDetails, setVideoDetails,
  metadata, setMetadata,
  uploading, handleUpload,
  dropzone
}: VideoUploadSectionProps) {
  const { getRootProps, getInputProps, isDragActive } = dropzone;
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Card className="border-dashed border-2 bg-muted/10 relative overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center min-h-[340px] text-center p-6">
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-colors ${isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}`}
          >
            <input {...getInputProps()} />
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg">Click to upload or drag & drop video</h3>
              <p className="text-sm text-muted-foreground">MP4, MOV, WEBM, AVI, MKV (5s to 60s clips, max. 100MB)</p>
              <div className="flex items-center justify-center gap-2 pt-2 text-xs font-medium text-amber-500">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimized for Adobe Stock, Pond5, Shutterstock, Getty & Artgrid</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-between h-full space-y-4">
            {/* Custom Video Player Container */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-black flex items-center justify-center group max-h-[420px] shadow-md">
              {previewUrl && (
                <video
                  ref={videoRef}
                  src={metadata?.videoUrl || previewUrl}
                  controls
                  className="w-full h-full object-contain"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    const w = v.videoWidth || 1920;
                    const h = v.videoHeight || 1080;
                    const res = w >= 3840 ? '4K UHD' : (w >= 1920 ? '1080p Full HD' : `${w}x${h}`);
                    setVideoDetails({
                      duration: v.duration || 0,
                      width: w,
                      height: h,
                      resolution: res
                    });
                  }}
                />
              )}
              
              <button 
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setVideoDetails(null);
                  setMetadata(null);
                }}
                className="absolute top-3 right-3 bg-background/80 backdrop-blur-md text-foreground p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive hover:text-destructive-foreground z-20"
                title="Remove Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Video File Specifications Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-sm p-4 bg-muted/40 rounded-xl border border-muted/50">
              <div className="col-span-2 sm:col-span-4 flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 truncate mr-2">
                  <VideoIcon className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground truncate">{file.name}</span>
                </div>
                <span className="text-muted-foreground whitespace-nowrap text-xs font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex flex-col bg-background/60 p-2.5 rounded-lg border border-border/40">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Format</span>
                <span className="font-medium mt-0.5 uppercase text-xs">{file.name.split('.').pop() || 'MP4'}</span>
              </div>
              <div className="flex flex-col bg-background/60 p-2.5 rounded-lg border border-border/40">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> Duration
                </span>
                <span className="font-medium mt-0.5 text-xs">
                  {videoDetails ? `${formatDuration(videoDetails.duration)}s` : 'Analyzing...'}
                </span>
              </div>
              <div className="flex flex-col bg-background/60 p-2.5 rounded-lg border border-border/40">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Resolution</span>
                <span className="font-medium mt-0.5 text-xs text-primary font-bold">
                  {videoDetails ? videoDetails.resolution : 'Calculating...'}
                </span>
              </div>
              <div className="flex flex-col bg-background/60 p-2.5 rounded-lg border border-border/40">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Dimensions</span>
                <span className="font-medium mt-0.5 text-xs font-mono">
                  {videoDetails ? `${videoDetails.width}x${videoDetails.height}` : '...'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {!metadata ? (
              <Button 
                className="w-full py-6 text-base font-semibold shadow-md flex items-center justify-center gap-2" 
                size="lg"
                disabled={uploading} 
                onClick={handleUpload}
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing Video Motion with Gemini AI...
                  </div>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" /> Generate Video Metadata (2 Credits)
                  </>
                )}
              </Button>
            ) : (
              <Button 
                className="w-full" 
                variant="outline"
                size="lg"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setVideoDetails(null);
                  setMetadata(null);
                }}
              >
                Upload Another Video
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
