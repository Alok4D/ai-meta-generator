"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Settings2, DownloadCloud, Trash2, Scissors } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
// @ts-ignore
import ImageTracer from "imagetracerjs";

type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
  size: number;
};

type TargetFormat = "jpeg" | "png" | "webp" | "svg" | "avif" | "ico" | "pdf" | "base64" | "bmp" | "gif";

export default function ImageConverterPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("webp");
  const [quality, setQuality] = useState<number>(80);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      size: file.size
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/bmp': [],
      'image/gif': []
    }
  });

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
  };

  const convertImage = (file: File, format: TargetFormat, q: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        // Handle SVG Vectorization
        if (format === "svg") {
          try {
            const svgString = ImageTracer.imagedataToSVG(
              ImageTracer.getImgdata(img),
              { ltres: 1, qtres: 1, pathomit: 8, colorsampling: 2 }
            );
            const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            resolve(blob);
          } catch (e) {
            console.error("Vectorization failed", e);
            resolve(new Blob(["<svg></svg>"], { type: "image/svg+xml" }));
          }
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        // If converting to JPEG, fill with white background first (since JPEG doesn't support transparency)
        if (format === "jpeg") {
          ctx!.fillStyle = "#ffffff";
          ctx!.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx!.drawImage(img, 0, 0);

        if (format === "base64") {
          const dataUrl = canvas.toDataURL("image/png");
          const blob = new Blob([dataUrl], { type: "text/plain" });
          resolve(blob);
          return;
        }
        
        const mimeType = format === "ico" ? "image/png" : `image/${format}`;
        
        canvas.toBlob(async (blob) => {
          if (format === "ico" && blob) {
            // ICO Header Construction
            const pngBuffer = await blob.arrayBuffer();
            const pngView = new Uint8Array(pngBuffer);
            const icoBuffer = new ArrayBuffer(22 + pngView.length);
            const view = new DataView(icoBuffer);
            
            view.setUint16(0, 0, true); 
            view.setUint16(2, 1, true); 
            view.setUint16(4, 1, true); 
            view.setUint8(6, 0); 
            view.setUint8(7, 0); 
            view.setUint8(8, 0); 
            view.setUint8(9, 0); 
            view.setUint16(10, 1, true); 
            view.setUint16(12, 32, true); 
            view.setUint32(14, pngView.length, true); 
            view.setUint32(18, 22, true); 
            
            new Uint8Array(icoBuffer, 22).set(pngView);
            resolve(new Blob([icoBuffer], { type: 'image/vnd.microsoft.icon' }));
          } else {
            resolve(blob!);
          }
        }, mimeType, q / 100);
      };
    });
  };

  const processBatch = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    setProgress(0);

    if (targetFormat === "pdf") {
      // Dynamically import jsPDF UMD build to prevent SSR build errors with Node.js worker_threads
      // @ts-ignore
      const jspdfModule = await import("jspdf/dist/jspdf.umd.min.js");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
      const doc = new jsPDF();
      for (let i = 0; i < images.length; i++) {
        const imgData = images[i]!;
        const img = new Image();
        img.src = imgData.previewUrl;
        await new Promise((res) => { img.onload = res; });
        
        if (i > 0) doc.addPage();
        
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const imgRatio = img.width / img.height;
        const pdfRatio = pdfWidth / pdfHeight;
        
        let finalW = pdfWidth;
        let finalH = pdfHeight;
        
        if (imgRatio > pdfRatio) {
          finalH = pdfWidth / imgRatio;
        } else {
          finalW = pdfHeight * imgRatio;
        }
        
        const x = (pdfWidth - finalW) / 2;
        const y = (pdfHeight - finalH) / 2;
        
        doc.addImage(img, 'JPEG', x, y, finalW, finalH);
        setProgress(Math.round(((i + 1) / images.length) * 100));
      }
      doc.save(`document_${Date.now()}.pdf`);
      setIsConverting(false);
      setProgress(0);
      return;
    }

    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i]!;
      const blob = await convertImage(imgData.file, targetFormat, quality);
      
      const originalName = imgData.file.name.replace(/\.[^/.]+$/, "");
      let ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
      if (targetFormat === "base64") ext = "txt";
      zip.file(`${originalName}_converted.${ext}`, blob);
      
      setProgress(Math.round(((i + 1) / images.length) * 100));
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    
    // Auto-trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_images_${Date.now()}.zip`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    setIsConverting(false);
    setProgress(0);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fmtName = (fmt: string) => fmt === "jpeg" ? "JPG" : fmt.toUpperCase();

  return (
    <div className="flex flex-col min-h-full pb-20 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 w-full">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-10 w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mt-2 mb-2 flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-primary" />
          Image Converter
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Fast, client-side batch image conversion. Your files never leave your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Sidebar: Global Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-background rounded-3xl p-6 shadow-sm border border-border/30 flex flex-col">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
              Conversion Settings
            </h2>

            <div className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Target Format</label>
                <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                  {(["jpg", "png", "svg", "webp", "avif", "ico", "pdf", "base64", "bmp", "gif"] as const).map((fmt) => {
                    const formatValue = fmt === "jpg" ? "jpeg" : fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => setTargetFormat(formatValue as TargetFormat)}
                        className={`
                          py-2 rounded-xl text-xs font-semibold uppercase transition-all border
                          ${targetFormat === formatValue 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-background text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
                          }
                        `}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality Slider */}
              <div className={`space-y-3 transition-opacity duration-300 ${['png', 'svg', 'ico', 'pdf', 'base64', 'gif', 'bmp'].includes(targetFormat) ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-foreground">Quality</label>
                  <span className="text-xs font-bold text-muted-foreground">{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="100" step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-[10px] text-muted-foreground">
                  {['png', 'svg', 'ico', 'pdf', 'base64', 'gif', 'bmp'].includes(targetFormat) ? `${fmtName(targetFormat)} format does not support lossy quality adjustment.` : 'Lower quality creates smaller files but reduces image sharpness.'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <Button 
                className="w-full rounded-xl h-12 text-base font-semibold shadow-md"
                disabled={images.length === 0 || isConverting}
                onClick={processBatch}
              >
                {isConverting ? (
                  `Processing... ${progress}%`
                ) : (
                  <span className="flex items-center gap-2">
                    <DownloadCloud className="w-5 h-5" />
                    {targetFormat === "pdf" ? "Convert to PDF" : "Convert & Download ZIP"}
                  </span>
                )}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-3 font-medium">
                {targetFormat === "pdf" ? "All images will be combined into a single PDF document." : (images.length > 0 ? `${images.length} images ready to convert` : 'Upload images to begin')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Area: Dropzone & Gallery */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Dropzone */}
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer
              transition-colors w-full min-h-[200px]
              ${isDragActive ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/30 bg-background"}
            `}
          >
            <input {...getInputProps()} />
            <div className="bg-secondary/50 p-3 rounded-2xl mb-3 text-muted-foreground">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base mb-1">Drag & drop multiple images here</h3>
            <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP, GIF, BMP</p>
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="bg-background rounded-3xl p-6 shadow-sm border border-border/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Uploaded Files ({images.length})</h3>
                <button 
                  onClick={clearAll}
                  className="text-xs font-semibold text-destructive hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                {images.map((img) => (
                  <div key={img.id} className="group relative bg-secondary/30 rounded-2xl overflow-hidden border border-border/50 aspect-square">
                    <img 
                      src={img.previewUrl} 
                      alt={img.file.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 text-center">
                      <p className="text-[10px] font-semibold truncate w-full">{img.file.name}</p>
                      <p className="text-[10px] text-muted-foreground mb-1">{formatBytes(img.size)}</p>
                      
                      <div className="flex gap-2">
                        {/* Editor Button Placeholder for Future */}
                        <button 
                          className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                          title="Edit Image (Coming Soon)"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                          className="bg-destructive/10 text-destructive p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
