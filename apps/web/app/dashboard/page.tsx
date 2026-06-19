"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { setUser } from "@/lib/feature/auth/authSlice";
import { useGetHistoryQuery } from "@/lib/feature/upload/uploadApi";
import { useCancelSubscriptionMutation } from "@/lib/feature/payment/paymentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Wand2, User as UserIcon, Zap, History } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
  
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: history = [], isLoading } = useGetHistoryQuery({});
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      const res = await cancelSubscription({}).unwrap();
      if (res.success && res.user) {
        dispatch(setUser(res.user));
        setIsCancelModalOpen(false);
        toast.success("Subscription canceled successfully.");
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    }
  };

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = history.filter((item: any) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate.getDate() === d.getDate() && 
               itemDate.getMonth() === d.getMonth() && 
               itemDate.getFullYear() === d.getFullYear();
      }).length;
      const cost = count * 1.5; // Example metric for the bar chart
      data.push({ name: dayName, generations: count, cost: cost });
    }
    return data;
  }, [history]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-32" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-3 w-32" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-4 w-32 mb-4" /><Skeleton className="h-8 w-12 mb-2" /><Skeleton className="h-3 w-24" /></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2"><CardContent className="p-6"><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64 mb-6" /><Skeleton className="h-[300px] w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48 mb-6" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-40" /></div>
            </div>
            <div className="space-y-3 pt-4 border-t">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-6" />
          </CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Overview</h2>
          <p className="text-muted-foreground">Welcome back, {user.name}. Here's what's happening today.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/generator")} className="gap-2 rounded-[4px] py-5">
          <Wand2 className="h-4 w-4" />
          Generate Metadata
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.credits}</div>
            <p className="text-xs text-muted-foreground mt-1">Credits remaining in your account</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Plan</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold capitalize">{user.activePlan?.name || 'Free'} Plan</div>
                <p className="text-xs text-muted-foreground mt-1">Upgrade for more credits</p>
              </div>
              {user.activePlan?.name !== 'Free' && user.activePlan?.name !== 'Basic' && user.activePlan && (
                <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                  <DialogTrigger render={<Button variant="destructive" size="sm" />}>
                    Cancel
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Subscription</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your subscription? You will be downgraded to the Free plan immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={isCanceling}>
                        Go Back
                      </Button>
                      <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCanceling}>
                        {isCanceling ? 'Canceling...' : 'Confirm Cancel'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Generations</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total metadata generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generation Activity</CardTitle>
            <CardDescription>Your metadata generation history over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" hide={true} />
                  <YAxis yAxisId="right" orientation="right" hide={true} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar yAxisId="left" dataKey="cost" fill="#1A73E8" barSize={40} />
                  <Line yAxisId="right" type="linear" dataKey="generations" stroke="#FF4081" strokeWidth={2} dot={{ r: 4, stroke: '#FF4081', strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar.includes('res.cloudinary.com') ? user.avatar.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/') : user.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    style={{ imageRendering: '-webkit-optimize-contrast' as any }}
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-500">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">{user.role || 'User'}</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/profile")}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
