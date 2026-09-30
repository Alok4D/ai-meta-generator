"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Video, Sparkles, Camera, SunMedium, Info } from "lucide-react";

export interface PlatformConfig {
  name: string;
  minTitle: number;
  maxTitle: number;
  defaultTitle: number;
  titleHint: string;
  minKeywords: number;
  maxKeywords: number;
  defaultKeywords: number;
  keywordHint: string;
  badgeColor?: string;
}

export const VIDEO_PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  universal: {
    name: 'Universal (All 9 Markets)',
    minTitle: 30,
    maxTitle: 150,
    defaultTitle: 120,
    titleHint: '(Formula: Camera Movement + Subject + Action + Setting + Mood)',
    minKeywords: 7,
    maxKeywords: 49,
    defaultKeywords: 49,
    keywordHint: '(Max 49 single keywords for 100% Universal & Adobe Stock compliance)',
  },
  adobe: {
    name: 'Adobe Stock Video',
    minTitle: 30,
    maxTitle: 200,
    defaultTitle: 70,
    titleHint: '(Recommended 50-70 chars, max 200. No 4K/HD tech specs in title)',
    minKeywords: 5,
    maxKeywords: 49,
    defaultKeywords: 49,
    keywordHint: '(Min: 5 - Max: 49 keywords. Adobe algorithm weights first 10 keywords heavily)',
  },
  pond5: {
    name: 'Pond5',
    minTitle: 20,
    maxTitle: 120,
    defaultTitle: 75,
    titleHint: '(Recommended 40-80 chars. Heavily favors Camera Movement & Shot Type)',
    minKeywords: 10,
    maxKeywords: 50,
    defaultKeywords: 45,
    keywordHint: '(Min: 10 - Max: 50 tags. Include shot techniques, speed & frame rate terms)',
  },
  shutterstock: {
    name: 'Shutterstock Footage',
    minTitle: 25,
    maxTitle: 200,
    defaultTitle: 120,
    titleHint: '(Recommended 50-150 chars. Formula: Who, What, Where, When, Why)',
    minKeywords: 7,
    maxKeywords: 50,
    defaultKeywords: 50,
    keywordHint: '(Min: 7 - Max: 50 keywords. Commercial buyer-intent tags)',
  },
  getty: {
    name: 'Getty / iStock',
    minTitle: 25,
    maxTitle: 120,
    defaultTitle: 90,
    titleHint: '(Concise factual action description without trademarked terms)',
    minKeywords: 10,
    maxKeywords: 50,
    defaultKeywords: 40,
    keywordHint: '(Min: 10 - Max: 50 keywords. Controlled vocabulary & concept tags)',
  },
  envato: {
    name: 'Envato (VideoHive)',
    minTitle: 20,
    maxTitle: 100,
    defaultTitle: 70,
    titleHint: '(B-roll, Overlays, Backgrounds & Motion Graphics targeted)',
    minKeywords: 10,
    maxKeywords: 50,
    defaultKeywords: 40,
    keywordHint: '(Min: 10 - Max: 50 tags. Include editor terms: loop, intro, transition)',
  },
  artgrid: {
    name: 'Motion Array / Artgrid',
    minTitle: 25,
    maxTitle: 120,
    defaultTitle: 85,
    titleHint: '(Cinematic storytelling: Lighting, Grading tone, Camera rig)',
    minKeywords: 15,
    maxKeywords: 50,
    defaultKeywords: 45,
    keywordHint: '(Min: 15 - Max: 50 tags. Atmospheric & cinematography tags)',
  },
  freepik: {
    name: 'Freepik Video',
    minTitle: 20,
    maxTitle: 150,
    defaultTitle: 80,
    titleHint: '(Descriptive, clear and accurate title without keyword stuffing)',
    minKeywords: 5,
    maxKeywords: 50,
    defaultKeywords: 40,
    keywordHint: '(Min: 5 - Max: 50 keywords. Strictly relevant search terms)',
  },
  vecteezy: {
    name: 'Vecteezy Video',
    minTitle: 20,
    maxTitle: 150,
    defaultTitle: 80,
    titleHint: '(Minimum 5 descriptive words representing the video clip)',
    minKeywords: 5,
    maxKeywords: 50,
    defaultKeywords: 40,
    keywordHint: '(Min: 5 - Max: 50 keywords for optimal indexing)',
  },
  dreamstime: {
    name: 'Dreamstime Video',
    minTitle: 20,
    maxTitle: 150,
    defaultTitle: 80,
    titleHint: '(Minimum 5 words title with 3 primary category matches)',
    minKeywords: 5,
    maxKeywords: 50,
    defaultKeywords: 45,
    keywordHint: '(Min: 5 - Max: 50 keywords. Clean commercial tagging)',
  },
};

interface VideoSettingsSidebarProps {
  platform: string;
  setPlatform: (val: string) => void;
  titleLength: number[];
  setTitleLength: (val: number[]) => void;
  maxTitleLength: number;
  minTitleLength: number;
  descriptionLength: number[];
  setDescriptionLength: (val: number[]) => void;
  keywordCount: number[];
  setKeywordCount: (val: number[]) => void;
  maxKeywords: number;
  minKeywords: number;
  selectedShotType: string;
  setSelectedShotType: (val: string) => void;
  selectedMood: string;
  setSelectedMood: (val: string) => void;
  prefix: string;
  setPrefix: (val: string) => void;
  suffix: string;
  setSuffix: (val: string) => void;
  negativeTitleWords: string;
  setNegativeTitleWords: (val: string) => void;
  negativeKeywords: string;
  setNegativeKeywords: (val: string) => void;
}

export function VideoSettingsSidebar({
  platform, setPlatform,
  titleLength, setTitleLength, maxTitleLength, minTitleLength,
  descriptionLength, setDescriptionLength,
  keywordCount, setKeywordCount, maxKeywords, minKeywords,
  selectedShotType, setSelectedShotType,
  selectedMood, setSelectedMood,
  prefix, setPrefix,
  suffix, setSuffix,
  negativeTitleWords, setNegativeTitleWords,
  negativeKeywords, setNegativeKeywords
}: VideoSettingsSidebarProps) {

  const platforms = [
    { id: 'universal', label: 'Universal (All 9 Markets)', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'adobe', label: 'Adobe Stock Video' },
    { id: 'pond5', label: 'Pond5' },
    { id: 'shutterstock', label: 'Shutterstock Footage' },
    { id: 'getty', label: 'Getty / iStock' },
    { id: 'envato', label: 'Envato (VideoHive)' },
    { id: 'artgrid', label: 'Motion Array / Artgrid' },
    { id: 'freepik', label: 'Freepik Video' },
    { id: 'vecteezy', label: 'Vecteezy Video' },
    { id: 'dreamstime', label: 'Dreamstime Video' },
  ];

  const shotTypes = [
    'Auto Detect',
    'Drone / Aerial',
    'Gimbal Smooth',
    'Slow Motion',
    'Timelapse',
    'Static Tripod',
    'Handheld B-Roll',
    'Close-up Macro',
    'Wide Panoramic'
  ];

  const moods = [
    'Auto Detect',
    'Golden Hour',
    'Cinematic Moody',
    'Daylight Crisp',
    'Studio Clean',
    'Night City Lights',
    'Dramatic Sunset',
    'Vibrant Colorful'
  ];

  const currentConfig: PlatformConfig = VIDEO_PLATFORM_CONFIG[platform] || VIDEO_PLATFORM_CONFIG['universal']!;

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4">
      <Card className="shadow-sm border-muted/60">
        <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Video SEO Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          {/* Target Stock Platform */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Target Marketplace</Label>
              <span className="text-[10px] text-primary font-medium">{currentConfig.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-all ${
                    platform === p.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]' 
                      : 'bg-background text-foreground hover:bg-muted/60'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Shot Type & Motion */}
          <div className="space-y-2 pt-2 border-t border-muted/50">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-primary" /> Camera Movement / Shot
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {shotTypes.map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedShotType(st === 'Auto Detect' ? '' : st)}
                  className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                    (selectedShotType === st || (!selectedShotType && st === 'Auto Detect'))
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting & Mood */}
          <div className="space-y-2 pt-2 border-t border-muted/50">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <SunMedium className="w-3.5 h-3.5 text-amber-500" /> Lighting & Mood
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {moods.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m === 'Auto Detect' ? '' : m)}
                  className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                    (selectedMood === m || (!selectedMood && m === 'Auto Detect'))
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5 pt-2 border-t border-muted/50">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16"/><path d="M4 15h16"/></svg>
                  Action Title Length
                </Label>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                  {titleLength[0] || currentConfig.defaultTitle} chars
                </span>
              </div>
              <Slider 
                value={titleLength} 
                onValueChange={(val: any) => setTitleLength(Array.isArray(val) ? val : [val])} 
                max={maxTitleLength} 
                min={minTitleLength} 
                step={1}
                className="cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground leading-snug flex items-start gap-1">
                <Info className="w-3 h-3 text-primary/70 shrink-0 mt-0.5" />
                <span>{currentConfig.titleHint}</span>
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h14"/><path d="M7 4h14"/><path d="M3 4h.01"/><path d="M3 12h.01"/><path d="M3 20h.01"/><path d="M7 12h14"/></svg>
                  Keywords Count
                </Label>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                  {keywordCount[0] || currentConfig.defaultKeywords} words
                </span>
              </div>
              <Slider 
                value={keywordCount} 
                onValueChange={(val: any) => setKeywordCount(Array.isArray(val) ? val : [val])} 
                max={maxKeywords} 
                min={minKeywords} 
                step={1}
                className="cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground leading-snug flex items-start gap-1">
                <Info className="w-3 h-3 text-primary/70 shrink-0 mt-0.5" />
                <span>{currentConfig.keywordHint}</span>
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-2 border-t border-muted/50">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Advanced Customization</Label>
            
            <div className="space-y-1.5">
              <Label htmlFor="vid-prefix-input" className="text-sm font-medium">Prefix</Label>
              <Input 
                id="vid-prefix-input"
                placeholder="e.g. B-Roll Footage - (Optional)" 
                className="h-8 text-sm" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vid-suffix-input" className="text-sm font-medium">Suffix</Label>
              <Input 
                id="vid-suffix-input"
                placeholder="e.g. - 4K Cinematic (Optional)" 
                className="h-8 text-sm" 
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vid-neg-title-input" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                Negative Title Words
              </Label>
              <Input 
                id="vid-neg-title-input"
                placeholder="e.g. cheap, free, vlog (Optional)" 
                className="h-8 text-sm" 
                value={negativeTitleWords}
                onChange={(e) => setNegativeTitleWords(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vid-neg-keywords-input" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                Negative Keywords
              </Label>
              <Input 
                id="vid-neg-keywords-input"
                placeholder="e.g. cartoon, 3d render (Optional)" 
                className="h-8 text-sm" 
                value={negativeKeywords}
                onChange={(e) => setNegativeKeywords(e.target.value)}
              />
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}

