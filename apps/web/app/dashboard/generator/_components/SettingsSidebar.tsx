"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Settings2, Sparkles } from "lucide-react";

interface SettingsSidebarProps {
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
  prefix: string;
  setPrefix: (val: string) => void;
  suffix: string;
  setSuffix: (val: string) => void;
  negativeTitleWords: string;
  setNegativeTitleWords: (val: string) => void;
  negativeKeywords: string;
  setNegativeKeywords: (val: string) => void;
}

export function SettingsSidebar({
  platform, setPlatform,
  titleLength, setTitleLength, maxTitleLength, minTitleLength,
  descriptionLength, setDescriptionLength,
  keywordCount, setKeywordCount, maxKeywords, minKeywords,
  prefix, setPrefix,
  suffix, setSuffix,
  negativeTitleWords, setNegativeTitleWords,
  negativeKeywords, setNegativeKeywords
}: SettingsSidebarProps) {
  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4">
      <Card className="shadow-sm border-muted/60">
        <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Metadata Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          {/* Export Platform */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Export Platform</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'general', label: 'General', icon: <Sparkles className="w-3.5 h-3.5"/> },
                { id: 'adobe', label: 'Adobe Stock' },
                { id: 'shutterstock', label: 'Shutterstock' },
                { id: 'both', label: 'Both (Adobe + Shutter)' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
                    platform === p.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-background text-foreground hover:bg-muted/60'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16"/><path d="M4 15h16"/></svg>
                  {platform === 'shutterstock' ? 'Description Length' : 'Title Length'}
                </Label>
                <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{titleLength[0] || 157} chars</span>
              </div>
              <Slider 
                value={titleLength} 
                onValueChange={(val: any) => setTitleLength(Array.isArray(val) ? val : [val])} 
                max={maxTitleLength} 
                min={minTitleLength} 
                step={1}
                className="cursor-pointer"
              />
              {platform === 'shutterstock' && (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Minimum 5 words - 0/2048)</p>
              )}
              {platform === 'adobe' && (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Max: 200 characters)</p>
              )}
              {platform === 'both' && (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Max 200 characters for Adobe)</p>
              )}
              {platform === 'both' && (
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16"/><path d="M4 15h16"/></svg>
                      Shutter Description
                    </Label>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{descriptionLength[0] || 200} chars</span>
                  </div>
                  <Slider 
                    value={descriptionLength} 
                    onValueChange={(val: any) => setDescriptionLength(Array.isArray(val) ? val : [val])} 
                    max={2048} 
                    min={20} 
                    step={1}
                    className="cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Max 2048 chars for Shutterstock)</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h14"/><path d="M7 4h14"/><path d="M3 4h.01"/><path d="M3 12h.01"/><path d="M3 20h.01"/><path d="M7 12h14"/></svg>
                  Keywords Count
                </Label>
                <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{keywordCount[0] || 41} words</span>
              </div>
              <Slider 
                value={keywordCount} 
                onValueChange={(val: any) => setKeywordCount(Array.isArray(val) ? val : [val])} 
                max={maxKeywords} 
                min={minKeywords} 
                step={1}
                className="cursor-pointer"
              />
              {platform === 'shutterstock' && (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Minimum 7 unique keywords 0/50)</p>
              )}
              {platform === 'adobe' && (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Min: 5 - Max: 49 keywords)</p>
              )}
              {platform === 'both' && (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">(Min 7 - Max 49 keywords)</p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-2 border-t border-muted/50">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Options</Label>
            
            <div className="space-y-1.5">
              <Label htmlFor="prefix-input" className="text-sm font-medium">Prefix</Label>
              <Input 
                id="prefix-input"
                placeholder="e.g. Stock Photo - (Optional)" 
                className="h-8 text-sm" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="suffix-input" className="text-sm font-medium">Suffix</Label>
              <Input 
                id="suffix-input"
                placeholder="e.g. - HD Quality (Optional)" 
                className="h-8 text-sm" 
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="neg-title-input" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                Negative Title Words
              </Label>
              <Input 
                id="neg-title-input"
                placeholder="e.g. free, cheap, best (Optional)" 
                className="h-8 text-sm" 
                value={negativeTitleWords}
                onChange={(e) => setNegativeTitleWords(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="neg-keywords-input" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                Negative Keywords
              </Label>
              <Input 
                id="neg-keywords-input"
                placeholder="e.g. cartoon, anime (Optional)" 
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
