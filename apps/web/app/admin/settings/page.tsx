"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Manage your website configuration and API keys.</p>
      </div>

      <div className="grid gap-6">
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
