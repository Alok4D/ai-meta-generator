"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { useGetHistoryQuery, useDeleteHistoryMutation } from "@/lib/feature/upload/uploadApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function HistoryPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: history = [], isLoading: loading } = useGetHistoryQuery(undefined, {
    skip: !user,
  });
  const [deleteHistory] = useDeleteHistoryMutation();
  const [viewItem, setViewItem] = useState<any>(null);

  const handleCopy = (keywords: string[]) => {
    navigator.clipboard.writeText(keywords.join(", "));
    toast.success("Keywords copied to clipboard!");
  };

  const handleDownloadCSV = (item: any) => {
    const safeTitle = item.title.replace(/"/g, '""');
    const safeKeywords = item.keywords.join(",").replace(/"/g, '""');
    const csvContent = `Title,Keywords,Category\n"${safeTitle}","${safeKeywords}","${item.category}"`;
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Generation History</h2>
        <p className="text-muted-foreground">View your past AI-generated SEO metadata.</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : history.length === 0 ? (
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
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history?.map((item: any) => (
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
                      <td className="px-6 py-4 font-medium max-w-xs truncate" title={item.title}>
                        {item.title}
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
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewItem(null)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold">Metadata Details</h3>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {viewItem.imageUrl && (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img src={viewItem.imageUrl} alt={viewItem.title} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Title</h4>
                <div className="p-3 bg-muted rounded-md text-sm">{viewItem.title}</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Category</h4>
                <div className="p-3 bg-muted rounded-md text-sm capitalize">{viewItem.category}</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Keywords ({viewItem.keywords?.length})</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewItem.keywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t bg-muted/20">
              <Button variant="outline" onClick={() => handleDownloadCSV(viewItem)}>Download CSV</Button>
              <Button onClick={() => handleCopy(viewItem.keywords)}>Copy Keywords</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
