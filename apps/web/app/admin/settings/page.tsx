"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetMagicWordQuery, useUpdateMagicWordMutation } from "@/lib/feature/admin/adminApi";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: magicWordData, isLoading: isLoadingMagicWord, refetch: refetchMagicWord } = useGetMagicWordQuery();
  const [updateMagicWord, { isLoading: isSavingMagicWord }] = useUpdateMagicWordMutation();
  const [magicWordInput, setMagicWordInput] = useState("");
  const [showMagicWord, setShowMagicWord] = useState(false);

  useEffect(() => {
    if (magicWordData?.magicWord !== undefined) {
      setMagicWordInput(magicWordData.magicWord);
    }
  }, [magicWordData]);

  const handleSaveMagicWord = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = magicWordInput.trim();
    if (trimmed.length < 3) {
      toast.error("Magic word must be at least 3 characters long.");
      return;
    }
    try {
      await updateMagicWord({ magicWord: trimmed }).unwrap();
      await refetchMagicWord();
      toast.success("Magic word updated! All previously unlocked user sessions have been invalidated.");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to update magic word.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Manage your website configuration and API keys.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <form onSubmit={handleSaveMagicWord}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                Apify System Magic Word
              </CardTitle>
              <CardDescription>
                Users must enter this magic word in Contributor Insights to unlock your system Apify API keys. Updating it immediately revokes previous sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="magicWord">Magic Word</Label>
                <div className="relative">
                  <Input
                    id="magicWord"
                    type={showMagicWord ? "text" : "password"}
                    value={magicWordInput}
                    onChange={(e) => setMagicWordInput(e.target.value)}
                    placeholder={isLoadingMagicWord ? "Loading..." : "Enter system magic word"}
                    disabled={isLoadingMagicWord}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMagicWord(!showMagicWord)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showMagicWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {magicWordData?.updatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(magicWordData.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSavingMagicWord || isLoadingMagicWord}>
                {isSavingMagicWord ? "Saving..." : "Update Magic Word"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Website Settings</CardTitle>
            <CardDescription>Configure basic information about your platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="AI Meta Generator" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" defaultValue="admin@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" defaultValue="https://example.com/logo.png" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input id="favicon" defaultValue="https://example.com/favicon.ico" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsUrl">Terms URL</Label>
                <Input id="termsUrl" defaultValue="/terms" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacyUrl">Privacy URL</Label>
                <Input id="privacyUrl" defaultValue="/privacy" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoMeta">SEO Meta Description</Label>
              <Input id="seoMeta" defaultValue="The best AI powered metadata generator for images." />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>Update your AI provider keys securely.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input id="openai" type="password" defaultValue="sk-..........................." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gemini">Google Gemini Key</Label>
              <Input id="gemini" type="password" defaultValue="" placeholder="Enter Gemini Key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claude">Claude API Key</Label>
              <Input id="claude" type="password" defaultValue="" placeholder="Enter Claude Key" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update API Keys</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
