"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { useUpdateProfileMutation } from "@/lib/feature/auth/authApi";
import { setUser } from "@/lib/feature/auth/authSlice";

export function UserProfileForm() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateProfile, { isLoading: isProfileLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    if (!firstName) {
      toast.error("First name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", `${firstName} ${lastName}`.trim());
      if (phone) formData.append("phone", phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      const result = await updateProfile(formData).unwrap();
      dispatch(setUser(result));
      toast.success("Profile updated successfully");
      setAvatarFile(null); // Reset file selection after success
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to update profile");
    }
  };

  const displayAvatar = avatarPreview || user.avatar;

  return (
    <TabsContent value="profile" className="mt-0">
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold uppercase overflow-hidden relative">
              {displayAvatar ? (
                <img 
                  src={displayAvatar.includes('res.cloudinary.com') ? displayAvatar.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/') : displayAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  style={{ imageRendering: '-webkit-optimize-contrast' as any }}
                />
              ) : (
                user.name.substring(0, 2)
              )}
            </div>
            <div>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/gif" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="+1 (555) 987-6543" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2 border-t pt-6 mt-4">
          <Button className="rounded-[5px] px-6 py-5" size={"lg"} onClick={handleProfileUpdate} disabled={isProfileLoading}>
            {isProfileLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" size={'lg'} className="rounded-[5px] px-6 py-5" onClick={() => {
            const nameParts = user.name.split(" ");
            setFirstName(nameParts[0] || "");
            setLastName(nameParts.slice(1).join(" ") || "");
            setPhone(user.phone || "");
            setAvatarPreview(null);
            setAvatarFile(null);
          }}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}