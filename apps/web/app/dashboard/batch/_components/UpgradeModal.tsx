import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-none !ring-0 shadow-2xl rounded-2xl p-8 bg-white flex flex-col items-center justify-center text-center">
        
        {/* Large Centered Icon (Matches SweetAlert style) */}
        <div className="w-24 h-24 rounded-full border-4 border-[#3b82f6] flex items-center justify-center mb-6 mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </div>

        <DialogHeader className="flex flex-col items-center w-full">
          <DialogTitle className="text-[28px] font-bold text-[#545454] tracking-wide mb-4">
            Unlock Batch
          </DialogTitle>
          <DialogDescription className="text-[15px] text-[#545454] leading-relaxed max-w-[90%]">
            Upgrade to a <strong className="font-bold text-[#333]">Pro</strong> or <strong className="font-bold text-[#333]">Agency</strong> plan to upload and process up to 50 assets at once with advanced AI metadata generation.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col items-center gap-3 mt-8 w-full">
          <Button 
            className="bg-[#212121] hover:bg-[#111] text-white px-8 h-12 text-[15px] font-medium rounded-md shadow-md transition-colors w-auto"
            onClick={() => router.push("/pricing")}
          >
            Upgrade plan
          </Button>
          <Button 
            variant="ghost" 
            className="text-[14px] font-medium text-gray-500 hover:text-gray-800 hover:bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
