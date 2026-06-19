"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, BarChart3, Layers, Hash, DollarSign } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useGetAnalyticsQuery } from '@/lib/feature/admin/adminApi';

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading, isError } = useGetAnalyticsQuery(undefined);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">AI Usage Analytics</h2>
          <p className="text-muted-foreground">Monitor API usage, performance, and estimated costs.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="shadow-sm border-muted/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="h-96 shadow-sm border-muted/60">
              <CardHeader>
                <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-full w-full bg-muted/30 animate-pulse rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-12 text-destructive">Failed to load analytics data.</div>;
  }

  const estimatedCost = ((stats?.totalRequests || 0) * 0.01).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Usage Analytics</h2>
        <p className="text-muted-foreground">Monitor API usage, performance, and estimated costs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.totalRequests || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.todayRequests || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-purple-500/5 border-purple-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.totalCategories || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-orange-500/5 border-orange-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Avg Keywords</CardTitle>
            <Hash className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats?.avgKeywords || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-red-500/5 border-red-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">${estimatedCost}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle>Daily Requests (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyRequests || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDaily)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle>Monthly Requests (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyRequests || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8}/>
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
                  <Bar dataKey="requests" fill="url(#colorMonthly)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle>Category Analytics</CardTitle>
            <CardDescription>Percentage distribution of metadata categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.categoryAnalytics?.map((cat: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium capitalize">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.percentage}% ({cat.count})</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
              {(!stats?.categoryAnalytics || stats.categoryAnalytics.length === 0) && (
                <p className="text-muted-foreground text-sm py-4 text-center">No category data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle>Most Generated Keywords</CardTitle>
            <CardDescription>Top 10 keywords across all generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats?.topKeywords?.map((kw: any, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-1.5 rounded-lg text-sm">
                  <span className="font-medium">{kw.keyword}</span>
                  <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-md font-bold">{kw.count}</span>
                </div>
              ))}
              {(!stats?.topKeywords || stats.topKeywords.length === 0) && (
                <p className="text-muted-foreground text-sm py-4 text-center w-full">No keywords data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
