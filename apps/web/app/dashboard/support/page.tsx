"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSubmitSupportMessageMutation } from "@/lib/feature/support/supportApi";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitMessage, { isLoading }] = useSubmitSupportMessageMutation();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    try {
      await submitMessage({ subject, message }).unwrap();
      toast.success("Message sent successfully! We'll be in touch soon.");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Contact Support</h2>
        <p className="text-muted-foreground mt-2">Have a question or need help? Send us a message.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
          <CardDescription>We typically reply within 24 hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              placeholder="What do you need help with?" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea 
              id="message" 
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe your issue or question in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
