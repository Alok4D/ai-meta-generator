import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Upload an image to generate SEO metadata.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Images Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">324</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-2 bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
            <p className="text-sm text-muted-foreground">SVG, PNG, JPG or EPS (max. 10MB)</p>
          </div>
          <Button>Select Image</Button>
        </CardContent>
      </Card>
    </div>
  );
}
