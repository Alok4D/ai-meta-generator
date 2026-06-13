"use client";

import React, { useState } from "react";
import { ArrowRight, Gift } from "lucide-react";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { useClaimWelcomeBonusMutation } from "@/lib/feature/auth/authApi";
import { setUser } from "@/lib/feature/auth/authSlice";
import { toast } from "sonner";
import WelcomeBonusModal from "./WelcomeBonusModal";
import ClaimSuccessModal from "./ClaimSuccessModal";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface CTAProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  buttonText?: string;
  claimBonusMode?: boolean;
}

export default function CTA({ 
  title = "Ready to automate your workflow?", 
  subtitle = <>Join thousands of stock contributors who save hours <br className="hidden sm:block" />every week with MetaGen AI.</>,
  buttonText = "Get Started Free",
  claimBonusMode = false
}: CTAProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claimBonus, { isLoading: isClaiming }] = useClaimWelcomeBonusMutation();

  const handleClaimBonus = async () => {
    if (!user) {
      setShowWelcomeModal(true);
      return;
    }
    
    if (user.hasClaimedWelcomeBonus) {
      toast.info("You have already claimed your welcome bonus!");
      return;
    }
    
    try {
      const res = await claimBonus({}).unwrap();
      dispatch(setUser(res));
      setShowSuccessModal(true);
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to claim bonus");
    }
  };
  
  return (
    <section className={`w-full bg-[#F3F5F7] py-20 md:py-28 ${space.className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* CTA Card */}
        <div className="bg-[#18181B] rounded-[30px] px-6 py-10 md:py-16 flex flex-col items-center text-center">
          
          <h2 className="text-[32px] md:text-[48px] font-bold text-white mb-5 tracking-tight leading-[1] md:leading-[48px]">
            {title}
          </h2>
          
          <p className="text-white/70 text-[18px] max-w-xl mx-auto mb-10 leading-[28px] font-normal">
            {subtitle}
          </p>
          
          {claimBonusMode && (!user || !user.hasClaimedWelcomeBonus) ? (
            <button 
              onClick={handleClaimBonus}
              disabled={isClaiming}
              className="bg-white hover:bg-gray-100 text-[#14181F] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-[14px] leading-[20px] font-semibold transition-all duration-200 hover:scale-105"
            >
              <Gift size={18} strokeWidth={2.5} />
              {isClaiming ? "Claiming..." : "Get 100 Free Credits"}
            </button>
          ) : (
            <Link href={user ? "/dashboard/generator" : "/login"}>
              <button className="bg-white hover:bg-gray-100 text-[#14181F] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 text-[14px] leading-[20px] font-semibold transition-all duration-200 hover:scale-105">
                {buttonText}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </Link>
          )}
          
        </div>
        
      </div>

      {claimBonusMode && (
        <>
          <WelcomeBonusModal 
            isOpen={showWelcomeModal} 
            onClose={() => setShowWelcomeModal(false)} 
          />
          <ClaimSuccessModal 
            isOpen={showSuccessModal} 
            onClose={() => setShowSuccessModal(false)} 
          />
        </>
      )}
    </section>
  );
}