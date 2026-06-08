"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminImagesPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Image History</h2>
        <p className="text-muted-foreground">View and manage generated metadata for all users.</p>
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
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                        <span className="text-xs text-muted-foreground">Image</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">demo@example.com</td>
                    <td className="px-6 py-4">SEO Optimized Title {item}</td>
                    <td className="px-6 py-4 capitalize">Technology</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs">View</Button>
                        <Button variant="secondary" size="sm" className="h-8 text-xs">Re-generate</Button>
                        <Button variant="destructive" size="sm" className="h-8 text-xs">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
