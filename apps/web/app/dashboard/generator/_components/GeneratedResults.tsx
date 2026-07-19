"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface GeneratedResultsProps {
  metadata: any;
  handleDownloadTXT: () => void;
  handleDownloadCSV: () => void;
  handleCopy: (text: string | undefined, label: string) => void;
  handleRegenerate: () => void;
  isRegenerating: boolean;
}

export function GeneratedResults({
  metadata,
  handleDownloadTXT,
  handleDownloadCSV,
  handleCopy,
  handleRegenerate,
  isRegenerating
}: GeneratedResultsProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const isFreePlan = !user?.activePlan || user?.activePlan?.name?.toLowerCase() === 'free';

  const onCsvClick = () => {
    if (isFreePlan) {
      Swal.fire({
        icon: 'warning',
        title: 'Upgrade Required',
        text: 'CSV download is only available for premium plans. Please upgrade your plan to unlock this feature.',
        confirmButtonText: 'View Pricing',
        confirmButtonColor: '#6366f1',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/dashboard/pricing');
        }
      });
    } else {
      handleDownloadCSV();
    }
  };

  return (
    <Card className="flex-1 border-muted/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <CardTitle className="text-xl">Generated Metadata</CardTitle>
        {metadata && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadTXT}><Download className="w-3 h-3 mr-1"/> TXT</Button>
            <Button variant="outline" size="sm" onClick={onCsvClick}><Download className="w-3 h-3 mr-1"/> CSV</Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {metadata ? (
          <div className="space-y-6">
            {metadata.platform === 'both' ? (
              <>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <h4 className="text-md font-medium text-muted-foreground">Adobe Title</h4>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleCopy(metadata.title, 'Adobe Title')}>Copy</Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm leading-relaxed">{metadata.title}</div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-muted-foreground mb-1">Adobe Category</h4>
                  <div className="p-3 bg-muted rounded-md text-sm capitalize">{metadata.adobeCategory}</div>
                </div>
                <div className="pt-4 border-t"></div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <h4 className="text-md font-medium text-muted-foreground">Shutterstock Description</h4>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleCopy(metadata.description, 'Shutterstock Description')}>Copy</Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm leading-relaxed">{metadata.description}</div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-muted-foreground mb-1">Shutterstock Category</h4>
                  <div className="p-3 bg-muted rounded-md text-sm capitalize">{metadata.shutterstockCategory}</div>
                </div>
                <div className="pt-4 border-t"></div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <h4 className="text-md font-medium text-muted-foreground">{metadata.platform === 'shutterstock' ? 'Description' : 'Title'}</h4>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleCopy(metadata.platform === 'shutterstock' ? metadata.description : metadata.title, metadata.platform === 'shutterstock' ? 'Description' : 'Title')}>Copy</Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm leading-relaxed">{metadata.platform === 'shutterstock' ? metadata.description : metadata.title}</div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-muted-foreground mb-1">Category</h4>
                  <div className="p-3 bg-muted rounded-md text-sm capitalize">{metadata.category}</div>
                </div>
              </>
            )}
            <div>
              <div className="flex justify-between items-end mb-1">
                <h4 className="text-md font-medium text-muted-foreground">Keywords ({metadata.keywords?.length || 49})</h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleCopy(metadata.keywords?.join(', '), 'Keywords')}>Copy</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/30 rounded-md border">
                {metadata.keywords.map((kw: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-background text-foreground border rounded-md text-sm font-medium shadow-sm capitalize">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <Button 
              variant="default" 
              className="w-full mt-4 py-5"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Regenerating...
                </div>
              ) : <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Output</>}
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            <p>Results will appear here after generation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
