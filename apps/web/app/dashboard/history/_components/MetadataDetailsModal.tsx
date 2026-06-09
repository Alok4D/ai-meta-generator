import { Button } from "@/components/ui/button";

interface MetadataDetailsModalProps {
  viewItem: any;
  setViewItem: (item: any) => void;
  handleDownloadCSV: (item: any) => void;
  handleCopy: (keywords: string[]) => void;
}

export default function MetadataDetailsModal({
  viewItem,
  setViewItem,
  handleDownloadCSV,
  handleCopy,
}: MetadataDetailsModalProps) {
  if (!viewItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewItem(null)}>
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-medium">Metadata Details</h3>
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
  );
}