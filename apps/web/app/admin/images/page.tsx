"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetUserGenerationStatsQuery, useGetAllGenerationsQuery } from "@/lib/feature/admin/adminApi";
import { Search, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminImagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  
  const { data, isLoading } = useGetUserGenerationStatsQuery({ page, limit: 12, search });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Generations</h2>
          <p className="text-muted-foreground">View and download image generation stats per user.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search user name, email..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full bg-muted"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-16 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : data?.stats?.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <h3 className="text-lg font-medium mb-1">No users found</h3>
          <p className="text-muted-foreground">No users have generated any images yet or your search didn't match anyone.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.stats?.map((stat: any) => (
            <Card key={stat.user._id} className="overflow-hidden hover:shadow-md transition-all flex flex-col border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary font-bold text-xl uppercase overflow-hidden border border-primary/20">
                    {stat.user.avatar ? (
                      <img src={stat.user.avatar} alt="Avatar" className="w-full h-full object-cover" style={{ imageRendering: '-webkit-optimize-contrast' as any }} />
                    ) : (
                      stat.user.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <CardTitle className="text-lg truncate">{stat.user.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate" title={stat.user.email}>{stat.user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.totalGenerations}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Images Generated</div>
                  {stat.lastGenerationDate && (
                    <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50 w-full">
                      Last active: {new Date(stat.lastGenerationDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/admin/images/${stat.user._id}`)}
                >
                  View all generation report
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {data?.pages > 1 && (
        <div className="flex items-center justify-between mt-8 border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {data.pages}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page >= data?.pages || isLoading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}


    </div>
  );
}
