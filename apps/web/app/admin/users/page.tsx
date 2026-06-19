"use client";

import { useState } from "react";
import { useGetAllUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from "@/lib/feature/admin/adminApi";
import { useGetSubscriptionsQuery } from "@/lib/feature/subscription/subscriptionApi";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from 'sweetalert2';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const { data, isLoading, isFetching } = useGetAllUsersQuery({ 
    page, 
    limit: 12, 
    search, 
    role: roleFilter,
    plan: planFilter
  });
  
  const { data: plans = [] } = useGetSubscriptionsQuery(undefined);
  
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState<string>("");
  const [viewingUser, setViewingUser] = useState<any>(null);

  const users = data?.users || [];
  const totalPages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to page 1 on new search
  };

  const handleRoleFilterChange = (val: string | null) => {
    if (val) {
      setRoleFilter(val);
      setPage(1); // Reset to page 1 on new filter
    }
  };

  const handlePlanFilterChange = (val: string | null) => {
    if (val) {
      setPlanFilter(val);
      setPage(1); // Reset to page 1 on new filter
    }
  };

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

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! The user account and data will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("User deleted successfully");
        if (users.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to delete user");
      }
    }
  };

  // Removed early return for isLoading to show skeleton instead

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage roles, credits, and search for users.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="pl-9 bg-background"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Select value={planFilter} onValueChange={handlePlanFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              {!plans.some((p: any) => p.name.toLowerCase() === 'free') && (
                <SelectItem value="free">Free Plan</SelectItem>
              )}
              {plans.map((plan: any) => (
                <SelectItem key={plan._id} value={plan.name.toLowerCase()}>{plan.name} Plan</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto relative min-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Images Gen.</th>
                  <th className="px-6 py-4 font-medium">Credits</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading || isFetching ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="bg-card">
                      <td className="px-6 py-4"><div className="h-4 bg-muted animate-pulse rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted animate-pulse rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted animate-pulse rounded-md w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted animate-pulse rounded w-8"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted animate-pulse rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted animate-pulse rounded-md w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-muted animate-pulse rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted animate-pulse rounded w-20"></div></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 bg-muted animate-pulse rounded w-12"></div>
                          <div className="h-8 bg-muted animate-pulse rounded w-12"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user._id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {user.activePlan?.name || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{user.imagesGenerated || 0}</td>
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
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-medium">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          defaultValue={user.role} 
                          onValueChange={(val) => val && handleUpdateRole(user._id, val)}
                        >
                          <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setViewingUser(user)}>View</Button>
                          <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing {users.length} of {totalUsers} total users
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="flex items-center gap-1 font-medium text-sm mx-2">
                  Page {page} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl uppercase overflow-hidden">
                  {viewingUser.avatar ? (
                    <img src={viewingUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    viewingUser.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{viewingUser.name}</h3>
                  <p className="text-muted-foreground text-sm">{viewingUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium capitalize">
                    {viewingUser.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">User ID</p>
                  <p className="font-medium truncate" title={viewingUser._id}>{viewingUser._id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Join Date</p>
                  <p className="font-medium">{new Date(viewingUser.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Credits Remaining</p>
                  <p className="font-medium text-xl">{viewingUser.credits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Active Plan</p>
                  <p className="font-medium">{viewingUser.activePlan?.name || 'Free Plan'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
