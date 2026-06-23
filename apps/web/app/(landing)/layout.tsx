import React from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <a
        href="https://wa.me/8801719277951"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300 drop-shadow-xl"
        title="Chat with us on WhatsApp"
      >
        <img
          src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
          alt="WhatsApp"
          className="w-14 h-14 animate-[spin_4s_linear_infinite]"
        />
      </a>
    </>
  );
}
