import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-background to-muted/50">
      <main className="flex flex-col items-center gap-8 max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-foreground">
          Generate Perfect AI Metadata in Seconds
        </h1>
        <p className="text-xl text-muted-foreground">
          Upload your images and instantly get SEO-optimized titles, categories, and keywords powered by advanced AI vision models.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <Link href="/register">
            <Button size="lg" className="px-8 text-lg rounded-full">Get Started for Free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 text-lg rounded-full">Log In</Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-card border shadow-sm">
            <h3 className="text-lg font-bold mb-2">Instant Generation</h3>
            <p className="text-sm text-muted-foreground">Get titles, categories, and 49+ keywords in one click.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm">
            <h3 className="text-lg font-bold mb-2">Multiple Modes</h3>
            <p className="text-sm text-muted-foreground">Export perfectly for Adobe Stock, Shutterstock, or Generic SEO.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm">
            <h3 className="text-lg font-bold mb-2">Central History</h3>
            <p className="text-sm text-muted-foreground">Keep track of all your past generated metadata in one secure place.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
