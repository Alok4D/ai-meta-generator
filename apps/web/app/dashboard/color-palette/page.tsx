"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, RefreshCw, Maximize, MousePointer2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { getPaletteSync } from "colorthief";

// Helper utilities for color conversion
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const rgbToHsl = (r: number, g: number, b: number) => {
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

export default function ColorPalettePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<number[][]>([]);
  const [numColors, setNumColors] = useState<number>(6);
  const [selectedColor, setSelectedColor] = useState<number[] | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);

  // Use ColorThief to extract the dominant palette once the image loads
  const extractColors = useCallback(() => {
    if (imgRef.current && imgRef.current.complete) {
      try {
        const palette = getPaletteSync(imgRef.current, { colorCount: numColors });
        if (palette) {
          setColors(palette.map(c => c.array()));
        }
      } catch (err) {
        console.error("Error extracting colors:", err);
      }
    }
  }, [numColors]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setColors([]); // Reset colors while loading
      setSelectedColor(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false
  });

  // Native EyeDropper API (Supported in Chrome/Edge)
  const pickColorWithEyeDropper = async () => {
    // @ts-ignore
    if (!window.EyeDropper) {
      alert("Your browser does not support the EyeDropper API.");
      return;
    }
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      // result.sRGBHex is returned
      // Convert HEX back to RGB to store it in state for uniformity
      const hex = result.sRGBHex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      setSelectedColor([r, g, b]);
    } catch (e) {
      console.log("EyeDropper canceled");
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 w-full">
      
      {/* Top Header */}
      <div className="flex flex-col items-center mb-10 w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mt-2 mb-2">
          Image color picker
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Extract beautiful color palettes from your photos instantly.
        </p>
      </div>

      {!imageSrc ? (
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center cursor-pointer
            transition-colors max-w-3xl mx-auto w-full min-h-[400px]
            ${isDragActive ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/30"}
          `}
        >
          <input {...getInputProps()} />
          <div className="bg-secondary/50 p-4 rounded-2xl mb-4">
            <UploadCloud className="w-8 h-8 text-foreground/70" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Drop your image here</h3>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          
          {/* Left Panel: Image Viewer */}
          <div className="flex flex-col gap-4">
            <div className="bg-background rounded-3xl p-6 shadow-sm border border-border/30 flex flex-col items-center justify-center relative min-h-[400px] group overflow-hidden">
              {/* Image */}
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="Uploaded for color extraction" 
                crossOrigin="anonymous"
                className="max-h-[500px] max-w-full object-contain rounded-xl"
                onLoad={extractColors}
              />

              {/* EyeDropper Floating Button */}
              {/* @ts-ignore */}
              {typeof window !== 'undefined' && window.EyeDropper && (
                <button 
                  onClick={pickColorWithEyeDropper}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background shadow-md border border-border px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MousePointer2 className="w-4 h-4" />
                  Click to pick a color
                </button>
              )}
            </div>

            {/* Change Image Button */}
            <div 
              {...getRootProps()}
              className="bg-muted/30 border border-dashed border-border/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground flex items-center justify-center gap-2"
            >
              <input {...getInputProps()} />
              <RefreshCw className="w-4 h-4" />
              Click or drop to change image
            </div>
          </div>

          {/* Right Panel: Extracted Colors */}
          <div className="flex flex-col gap-6">
            
            {/* Controls & Strips */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground font-medium">Colors</span>
                  <select 
                    value={numColors}
                    onChange={(e) => {
                      setNumColors(Number(e.target.value));
                      // Needs a slight timeout to let state update before extraction
                      setTimeout(extractColors, 10);
                    }}
                    className="bg-background border border-border rounded-lg px-2 py-1 outline-none focus:ring-2 ring-primary/20"
                  >
                    {[3, 4, 5, 6, 8, 10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                
                <Button variant="outline" size="icon" onClick={extractColors} title="Refresh Palette">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              {/* Palette Strip */}
              {colors.length > 0 && (
                <div className="h-12 w-full rounded-2xl overflow-hidden flex shadow-sm border border-border/30">
                  {colors.map((c, i) => (
                    <div 
                      key={i} 
                      className="h-full flex-1 transition-all hover:flex-[1.5]" 
                      style={{ backgroundColor: rgbToHex(c[0], c[1], c[2]) }} 
                    />
                  ))}
                </div>
              )}
              
              {/* If user used eyedropper, show selected color strip */}
              {selectedColor && (
                <div className="h-12 w-full rounded-2xl overflow-hidden flex shadow-sm border border-border/30 mt-2">
                  <div 
                    className="h-full flex-1 flex items-center justify-center text-white font-bold drop-shadow-md text-sm tracking-wider" 
                    style={{ backgroundColor: rgbToHex(selectedColor[0], selectedColor[1], selectedColor[2]) }} 
                  >
                    PICKED: {rgbToHex(selectedColor[0], selectedColor[1], selectedColor[2]).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Extracted Palette</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Prepend Selected Color if exists */}
                {selectedColor && (
                  <ColorCard rgb={selectedColor} isPicked />
                )}
                
                {/* Extracted Colors Grid */}
                {colors.map((c, i) => (
                  <ColorCard key={i} rgb={c} />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual color cards
function ColorCard({ rgb, isPicked = false }: { rgb: number[], isPicked?: boolean }) {
  const [r, g, b] = rgb;
  const hex = rgbToHex(r, g, b).toUpperCase();
  const hsl = rgbToHsl(r, g, b);
  
  return (
    <div className={`bg-background rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md ${isPicked ? 'border-primary ring-2 ring-primary/20' : 'border-border/30'}`}>
      <div 
        className="h-28 w-full flex items-end p-3 relative group"
        style={{ backgroundColor: hex }}
      >
        <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-foreground">
          {hex}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-wider">RGB</span>
          <span className="text-xs font-medium text-foreground">{`rgb(${r}, ${g}, ${b})`}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-wider">HSL</span>
          <span className="text-xs font-medium text-foreground">{hsl}</span>
        </div>
      </div>
    </div>
  );
}
