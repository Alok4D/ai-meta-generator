"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Wand2, Film, Play } from "lucide-react";
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
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:10';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/><path d="M12 3v3"/><path d="m10 4 2-2 2 2"/></svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
              <p className="text-sm text-muted-foreground">MP4, MOV, WEBM, AVI or MKV (max. 2GB)</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-between h-full space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center group max-h-[400px]">
              {metadata?.thumbnailUrl ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img src={metadata.thumbnailUrl} alt="Video Preview" className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <Play className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                </div>
              ) : (hasPlaybackError || (file.name.toLowerCase().endsWith('.mov') && (!previewUrl || hasPlaybackError))) ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-muted/10">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Film className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Video File Selected</p>
                    <p className="text-sm text-muted-foreground mt-1">Direct browser preview unavailable</p>
                    <p className="text-xs text-muted-foreground mt-1">Ready for AI metadata analysis</p>
                  </div>
                </div>
              ) : (
                previewUrl && (
                  <video
                    ref={videoRef}
                    src={`${previewUrl}#t=0.001`}
                    preload="metadata"
                    controls
                    className="max-w-full max-h-full object-contain"
                    onError={() => setHasPlaybackError(true)}
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      const w = v.videoWidth || 1920;
                      const h = v.videoHeight || 1080;
                      const res = w >= 3840 ? '4K UHD' : (w >= 1920 ? '1080p Full HD' : `${w} x ${h}`);
                      setVideoDetails({
                        duration: v.duration || 10,
                        width: w,
                        height: h,
                        resolution: res
                      });
                    }}
                  />
                )
              )}
              
              <button 
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setVideoDetails(null);
                  setMetadata(null);
                  setHasPlaybackError(false);
                }}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-destructive-foreground z-10"
                title="Remove Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-left text-sm p-4 bg-muted/50 rounded-lg">
              <div className="col-span-2 sm:col-span-4 flex justify-between items-center border-b pb-2">
                <span className="font-medium text-foreground truncate mr-2">{file.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Format</span>
                <span className="font-medium mt-0.5 uppercase">{file.name.split('.').pop() || 'MP4'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Duration</span>
                <span className="font-medium mt-0.5">
                  {videoDetails ? `${formatDuration(videoDetails.duration)}` : 'Calculating...'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Resolution</span>
                <span className="font-medium mt-0.5">
                  {videoDetails ? videoDetails.resolution : 'Calculating...'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Dimensions</span>
                <span className="font-medium mt-0.5">
                  {videoDetails ? `${videoDetails.width} x ${videoDetails.height}` : 'Calculating...'}
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
                    Analyzing Video with AI...
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
                  setVideoDetails(null);
                  setMetadata(null);
                  setHasPlaybackError(false);
                }}
              >
                Upload New Video
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
