import React, { useEffect } from "react";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import confetti from "canvas-confetti";

interface ClaimSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimSuccessModal({ isOpen, onClose }: ClaimSuccessModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random() + 0.2, y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px] bg-white border-0 ring-0 shadow-2xl text-slate-900 rounded-[24px] p-0 overflow-hidden outline-none">
        <DialogTitle className="sr-only">Congratulations</DialogTitle>
        <div className="relative p-8 flex flex-col items-center text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 text-green-600">
            <Check size={32} strokeWidth={3} />
          </div>
          
          <h2 className="text-[32px] font-bold mb-4 tracking-tight">Congratulations!</h2>
          
          <p className="text-slate-500 text-[16px] mb-8 leading-relaxed max-w-[260px] mx-auto">
            100 Credits added to your account!
          </p>
          
          <button 
            onClick={onClose}
            className="w-full bg-[#18181B] hover:bg-black text-white py-3.5 rounded-2xl font-bold text-[15px] transition-colors shadow-sm"
          >
            Awesome, Thanks!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
