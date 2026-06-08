"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and subscription.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pwd">Current Password</Label>
              <Input id="current-pwd" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pwd">New Password</Label>
              <Input id="new-pwd" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary">Change Password</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Free Plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-lg">Free Plan</p>
                <p className="text-sm text-muted-foreground">{user.credits} credits remaining</p>
              </div>
              <Button>Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
