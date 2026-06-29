"use client";

export function AuthBackground() {
  const videoUrl = "https://slp-statics.astockcdn.net/static_assets/staging/ai_studio/homepage/Storytelling.mp4";

  return (
    <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full"
      />
    </div>
  );
}
