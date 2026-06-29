"use client";

import { useState, useRef, useEffect } from "react";

export function AuthBackground() {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = "https://slp-statics.astockcdn.net/static_assets/staging/ai_studio/homepage/Storytelling.mp4";

  useEffect(() => {
    // If the video is already loaded (e.g. from cache), the onCanPlay event might not fire.
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
