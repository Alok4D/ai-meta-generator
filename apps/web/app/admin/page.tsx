"use client";

import { useGetAdminOverviewQuery } from "@/lib/feature/admin/adminApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Image as ImageIcon, Coins, Activity, DollarSign, Crown, MessageSquare } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function AdminOverview() {
  const { data: stats, isLoading, isError } = useGetAdminOverviewQuery(undefined);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h2>
          <p className="text-muted-foreground">High-level metrics and performance analytics for your AI Meta Generator.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="shadow-sm border-muted/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2"></div>
                <div className="h-3 w-32 bg-muted animate-pulse rounded mt-3"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="shadow-sm border-muted/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded-full"></div>
                  <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4 bg-muted/30 animate-pulse rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-12 text-destructive">Failed to load stats. Please try again.</div>;
  }

  const userGrowth = stats?.userGrowth || [];
  const uploadGrowth = stats?.uploadGrowth || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h2>
        <p className="text-muted-foreground">High-level metrics and performance analytics for your AI Meta Generator.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered accounts on platform
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Images Processed</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.totalUploads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total metadata generations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Earnings from subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-purple-500/5 border-purple-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Crown className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.totalPremiumUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Accounts on active plans
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-red-500/5 border-red-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.pendingSupportTickets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unresolved support requests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>User Growth</CardTitle>
            </div>
            <CardDescription>New user registrations over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <CardTitle>Generation Activity</CardTitle>
            </div>
            <CardDescription>Metadata generations over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uploadGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="uploads" fill="url(#colorUploads)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
