"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const backgrounds = [
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=1974&auto=format&fit=crop", // Dark ocean waves
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=2076&auto=format&fit=crop", // Dark misty mountain
  "https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=2148&auto=format&fit=crop", // Dark stormy sea
  "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?q=80&w=2071&auto=format&fit=crop", // Night sky over calm water
  "https://images.unsplash.com/photo-1475257026007-0753d5429e10?q=80&w=2070&auto=format&fit=crop", // Starry night over mountains
];

export function AuthBackground() {
  const [bgImage, setBgImage] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    if (randomBg !== undefined) {
      setBgImage(randomBg);
    }
  }, []);

  if (!bgImage) return <div className="absolute inset-0 bg-[#0a0a0f] z-0" />;

  return (
    <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
      <Image
        src={bgImage}
        alt="Background"
        fill
        className={`object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        priority
      />
    </div>
  );
}
