"use client";

import { useState } from "react";
import { useGetAllUsersQuery, useUpdateUserMutation } from "@/store/apiSlice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useGetAllUsersQuery(undefined);
  const [updateUser] = useUpdateUserMutation();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState<string>("");

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUser({ id: userId, role: newRole }).unwrap();
      toast.success("User role updated successfully");
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to update role");
    }
  };

  const handleUpdateCredits = async (userId: string) => {
    try {
      const credits = parseInt(creditsInput, 10);
      if (isNaN(credits)) {
        toast.error("Invalid credits value");
        return;
      }
      await updateUser({ id: userId, credits }).unwrap();
      toast.success("User credits updated successfully");
      setEditingUserId(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to update credits");
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage roles and credits for all users on the platform.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Credits</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users?.map((user: any) => (
                  <tr key={user._id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <Select 
                        defaultValue={user.role} 
                        onValueChange={(val) => handleUpdateRole(user._id, val)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      {editingUserId === user._id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-20 h-8 text-xs" 
                            value={creditsInput}
                            onChange={(e) => setCreditsInput(e.target.value)}
                          />
                          <Button size="sm" className="h-8 px-2" onClick={() => handleUpdateCredits(user._id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingUserId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.credits}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              setEditingUserId(user._id);
                              setCreditsInput(user.credits.toString());
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
