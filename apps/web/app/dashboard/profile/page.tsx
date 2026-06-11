"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Lock } from "lucide-react";
import { UserProfileForm } from "./_components/UserProfileForm";
import { PasswordUpdateForm } from "./_components/PasswordUpdateForm";

export default function ProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full flex-col">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile Settings
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </TabsTrigger>
        </TabsList>

        <UserProfileForm />
        <PasswordUpdateForm />
      </Tabs>
    </div>
  );
}
