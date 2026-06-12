import React from "react";
import { Info, X } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeBonusModal({ isOpen, onClose }: WelcomeBonusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px] bg-white border-0 ring-0 shadow-2xl text-slate-900 rounded-[24px] p-0 overflow-hidden outline-none">
        <DialogTitle className="sr-only">Welcome Bonus</DialogTitle>
        <div className="relative p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
            <Info size={32} />
          </div>
          
          <h2 className="text-[28px] font-bold mb-3 tracking-tight">Welcome Bonus</h2>
          
          <p className="text-slate-500 text-[16px] mb-8">
            Please login first to claim your bonus!
          </p>
          
          <Link href="/login" className="w-full">
            <button 
              onClick={onClose}
              className="w-full bg-[#18181B] hover:bg-black text-white py-3.5 rounded-2xl font-bold text-[15px] transition-colors shadow-sm"
            >
              Awesome, Thanks!
            </button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
