import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      tagline: "Perfect for testing the waters.",
      price: "0",
      features: [
        { text: "5 AI generations per month", available: true },
        { text: "Basic product descriptions", available: true },
        { text: "Basic SEO optimization", available: true },
        { text: "Image search", available: false },
        { text: "Image editing", available: false },
        { text: "Video discovery", available: false },
        { text: "Market Pricing analysis", available: false },
        { text: "Multilingual", available: false },
        { text: "Platform integrations", available: false },
      ],
      popular: false,
    },
    {
      name: "Starter",
      tagline: "Ideal for growing e-commerce merchants.",
      price: "29",
      features: [
        { text: "50 AI generations per month", available: true },
        { text: "Advanced product descriptions", available: true },
        { text: "Full SEO optimization", available: true },
        { text: "Image Search", available: true },
        { text: "Video discovery", available: true },
        { text: "Market pricing analysis", available: true },
        { text: "Platform integrations: 1", available: true },
        { text: "Image editing", available: false },
        { text: "Multilingual", available: false },
      ],
      popular: true,
    },
    {
      name: "Pro",
      tagline: "For high-volume sellers and agencies.",
      price: "79",
      features: [
        { text: "Unlimited AI generations", available: true },
        { text: "Advanced product descriptions", available: true },
        { text: "SEO optimization (Full + AI)", available: true },
        { text: "Image Search", available: true },
        { text: "Video discovery", available: true },
        { text: "Market pricing analysis", available: true },
        { text: "Image editing", available: true },
        { text: "Multilingual", available: true },
        { text: "All platform integrations", available: true },
      ],
      popular: false,
    },
  ];

  return (
    <section className="w-full py-24 bg-white px-4">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-[#00A64C] text-5xl font-bold mb-4">Pricing</h2>
        <p className="text-gray-900 font-medium mb-1">Choose the plan that fits you</p>
        <p className="text-gray-500 text-sm">
          Start With Starter free with 3 credits. Upgrade anytime as your business grows.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:gap-4">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`
              relative rounded-[32px] p-8 transition-all duration-300 border
              ${plan.popular 
                ? 'bg-[#D1F2DE] border-[#A8E6C1] scale-105 z-10 py-12 shadow-xl' 
                : 'bg-white border-gray-100 scale-100 py-10 shadow-sm'}
            `}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[#111827] mb-2">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6">{plan.tagline}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-[#111827]">${plan.price}</span>
                <span className="text-gray-500 font-medium text-sm">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {plan.features.map((feature, fIndex) => (
                <div key={fIndex} className="flex items-center gap-3">
                  {feature.available ? (
                    <div className="shrink-0 w-5 h-5 rounded-full border border-[#00A64C] flex items-center justify-center">
                      <Check className="text-[#00A64C]" size={12} />
                    </div>
                  ) : (
                    <X className="text-gray-400 shrink-0" size={18} />
                  )}
                  <span className={`text-sm ${feature.available ? 'text-[#374151]' : 'text-gray-400'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {plan.popular && (
              <button className="w-full bg-[#00A64C] text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#008f41] transition-all">
                Join Early Access <ArrowRight size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;