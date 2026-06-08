"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetHistoryQuery } from "@/store/apiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: history = [], isLoading: loading, isError } = useGetHistoryQuery(undefined, {
    skip: !user,
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <Card key={item._id} className="overflow-hidden flex flex-col">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1 mt-2 mb-4">
                  {item.keywords.slice(0, 5).map((kw: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-medium">
                      {kw}
                    </span>
                  ))}
                  {item.keywords.length > 5 && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-medium">
                      +{item.keywords.length - 5} more
                    </span>
                  )}
                </div>
                <div className="mt-auto text-[10px] text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
