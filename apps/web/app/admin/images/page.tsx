"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllGenerationsQuery } from "@/lib/feature/admin/adminApi";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export default function AdminImagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useGetAllGenerationsQuery({ page, limit: 10, search });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Image History</h2>
          <p className="text-muted-foreground">View and track generated metadata for all users.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search title, category..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Image Preview</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                      Loading generations...
                    </td>
                  </tr>
                ) : data?.generations?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No generation history found.
                    </td>
                  </tr>
                ) : (
                  data?.generations?.map((item: any) => (
                    <tr key={item._id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title || 'Generated image'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No img</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{item.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={item.title || 'Untitled'}>
                        {item.title || 'Untitled'}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                              <Eye className="h-3 w-3" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{item.title || 'Untitled Generation'}</DialogTitle>
                              <DialogDescription>Generated by {item.user?.name} on {new Date(item.createdAt).toLocaleDateString()}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="aspect-square w-full rounded-md overflow-hidden bg-muted relative">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No image available</div>
                                )}
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                  <span className="font-semibold text-muted-foreground">Category</span>
                                  <span className="col-span-2 capitalize">{item.category}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                  <span className="font-semibold text-muted-foreground">Platform</span>
                                  <span className="col-span-2 capitalize">{item.platform}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                  <span className="font-semibold text-muted-foreground">Keywords</span>
                                  <div className="col-span-2 flex flex-wrap gap-1">
                                    {item.keywords?.map((kw: string, i: number) => (
                                      <span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">{kw}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {data?.pages > 1 && (
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing page {page} of {data.pages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page >= data?.pages || isLoading}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
