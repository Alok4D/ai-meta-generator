"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { User as UserIcon, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilePage() {

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
        <p className="text-muted-foreground">Manage your admin account information and security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full flex-col">
        <TabsList className="flex w-full justify-start mb-6 bg-transparent p-0 border-b rounded-none h-12 gap-6">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent flex gap-2 h-full px-2"
          >
            <UserIcon className="h-4 w-4" />
            Profile Settings
          </TabsTrigger>
          <TabsTrigger 
            value="password"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent flex gap-2 h-full px-2"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </TabsTrigger>

        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold uppercase">
                  {user.name.substring(0, 2)}
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user.name.split(' ')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user.name.split(' ').slice(1).join(' ')} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user.email} disabled />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 987-6543" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2 border-t pt-6 mt-4">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
              <Button onClick={handlePasswordUpdate} disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
