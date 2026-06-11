"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";

export function PasswordUpdateForm() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update password");
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="password" className="mt-0">
      <Card className="max-w-2xl border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input 
              id="current" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input 
              id="new" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input 
              id="confirm" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 mt-4">
          <Button size={'lg'} className="rounded-[5px] px-5 py-5" onClick={handlePasswordUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}