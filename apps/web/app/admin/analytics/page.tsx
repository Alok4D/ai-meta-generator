"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Clock, DollarSign, XCircle } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Usage Analytics</h2>
        <p className="text-muted-foreground">Monitor API usage, performance, and estimated costs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145,231</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$342.50</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Daily Requests (Placeholder Chart)</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center text-muted-foreground border-t border-dashed">
            [Chart Area]
          </CardContent>
        </Card>
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Monthly Requests (Placeholder Chart)</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center text-muted-foreground border-t border-dashed">
            [Chart Area]
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Category Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center"><span>Business</span> <span className="font-bold">45%</span></li>
              <li className="flex justify-between items-center"><span>Technology</span> <span className="font-bold">25%</span></li>
              <li className="flex justify-between items-center"><span>Nature</span> <span className="font-bold">15%</span></li>
              <li className="flex justify-between items-center"><span>Food</span> <span className="font-bold">10%</span></li>
              <li className="flex justify-between items-center"><span>Travel</span> <span className="font-bold">5%</span></li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Generated Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">business (1.2k)</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">technology (900)</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">ai (850)</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">marketing (720)</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">office (600)</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>File Management Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center"><span>JPG</span> <span className="font-bold">60%</span></li>
              <li className="flex justify-between items-center"><span>PNG</span> <span className="font-bold">25%</span></li>
              <li className="flex justify-between items-center"><span>SVG</span> <span className="font-bold">10%</span></li>
              <li className="flex justify-between items-center"><span>EPS</span> <span className="font-bold">5%</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
