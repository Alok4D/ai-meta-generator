"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { useGetHistoryQuery, useDeleteHistoryMutation } from "@/lib/feature/upload/uploadApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Filter } from "lucide-react";
import MetadataDetailsModal from "./_components/MetadataDetailsModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HistoryPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: history = [], isLoading: loading } = useGetHistoryQuery(undefined, {
    skip: !user,
  });
  const [deleteHistory] = useDeleteHistoryMutation();
  const [viewItem, setViewItem] = useState<any>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const filteredHistory = history.filter((item: any) => {
    if (filterPlatform === "all") return true;
    if (filterPlatform === "general") return !item.platform || item.platform === "general";
    return item.platform === filterPlatform;
  });

  const handleCopy = (keywords: string[]) => {
    navigator.clipboard.writeText(keywords.join(", "));
    toast.success("Keywords copied to clipboard!");
  };

  const handleDownloadCSV = (item: any) => {
    const mainText = item.platform === 'shutterstock' ? item.description : item.title;
    const safeTitle = mainText ? mainText.replace(/"/g, '""') : '';
    const safeKeywords = item.keywords ? item.keywords.join(",").replace(/"/g, '""') : '';
    const labelText = item.platform === 'shutterstock' ? 'Description' : 'Title';
    const csvContent = `Filename,${labelText},Keywords,Category\n"image","${safeTitle}","${safeKeywords}","${item.category}"`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metadata-${item._id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this history item?")) {
      try {
        await deleteHistory(id).unwrap();
        toast.success("Item deleted successfully");
      } catch (err: any) {
        toast.error(err.data?.error || "Failed to delete item");
      }
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Generation History</h2>
          <p className="text-muted-foreground">View your past AI-generated SEO metadata.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-full sm:w-[200px] py-5 bg-card border-border shadow-sm hover:bg-muted/50 transition-colors h-10 font-medium">
              <div className="flex items-center gap-2.5 text-foreground/80 w-full">
                <Filter className="w-4 h-4 text-primary flex-shrink-0" />
                {filterPlatform === "all" && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                    <span className="truncate">All Platforms</span>
                  </div>
                )}
                {filterPlatform === "adobe" && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="truncate">Adobe Stock</span>
                  </div>
                )}
                {filterPlatform === "shutterstock" && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="truncate">Shutterstock</span>
                  </div>
                )}
                {filterPlatform === "general" && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="truncate">General</span>
                  </div>
                )}
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="font-medium">
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                  All Platforms
                </span>
              </SelectItem>
              <SelectItem value="adobe">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Adobe Stock
                </span>
              </SelectItem>
              <SelectItem value="shutterstock">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Shutterstock
                </span>
              </SelectItem>
              <SelectItem value="general">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  General
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl bg-muted/10">
          No history found. Generate some metadata first!
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Image</th>
                    <th className="px-6 py-4 font-medium">Title / Description</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredHistory?.map((item: any) => (
                    <tr key={item._id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        {item.imageUrl ? (
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium min-w-[300px]" title={item.platform === 'shutterstock' ? item.description : item.title}>
                        {item.platform === 'shutterstock' ? item.description : item.title}
                      </td>
                      <td className="px-6 py-4 capitalize">{item.category}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => setViewItem(item)}>View</Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => handleCopy(item.keywords)}>Copy</Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => handleDownloadCSV(item)}>Download</Button>
                          <Button variant="destructive" size="sm" className="h-8 px-2 text-xs" onClick={() => handleDelete(item._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Modal */}
      <MetadataDetailsModal 
        viewItem={viewItem} 
        setViewItem={setViewItem} 
        handleDownloadCSV={handleDownloadCSV} 
        handleCopy={handleCopy} 
      />
    </div>
  );
}
