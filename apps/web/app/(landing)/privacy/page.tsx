import React from "react";
import { Space_Grotesk } from 'next/font/google';
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className={`w-full bg-[#F3F5F7] min-h-screen py-24 md:py-32 ${space.className}`}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
          <h1 className="text-[36px] font-bold text-[#14181F] mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 mb-10 font-sans">Last updated: March 18, 2026</p>

          <div className="space-y-8 text-[#14181F] text-[15px] leading-relaxed font-sans">
            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">1. Introduction</h2>
              <p>Welcome to MetaGen AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our AI metadata generation tools.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">2. Data We Collect</h2>
              <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong>Content Data:</strong> includes the images, videos, and vectors you upload for metadata generation. <em>Note: Uploaded files are temporarily processed and securely deleted after generation is complete.</em></li>
                <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">3. How We Use Your Data</h2>
              <p className="mb-2">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>To provide the core functionality of generating metadata for your stock files.</li>
                <li>To manage your account, subscription, and credit balance.</li>
                <li>To improve our AI models and overall service quality.</li>
                <li>To communicate with you regarding updates, support, and security alerts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">4. Data Security</h2>
              <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use secure cloud infrastructure to process your files, and we do not use your private portfolio files to train public AI models.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">5. Third-Party Services</h2>
              <p>We may employ third-party companies and services to facilitate our service (such as AI processing APIs or payment gateways like Stripe). These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">6. Your Legal Rights</h2>
              <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold mb-3 font-sans">7. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact our support team through our Discord community or via the contact form on our website.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
