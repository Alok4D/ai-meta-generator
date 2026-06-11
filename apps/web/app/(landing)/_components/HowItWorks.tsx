import React from 'react';
import { Upload, Wand2, PenTool, ShoppingCart } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Upload Your Product Image",
      description: "Just choose or drag-and-drop a product photo. Our AI instantly analyzes the object, category, style, material, and key details.",
      icon: <Upload size={48} className="text-[#89D6AE]" />,
      align: "left",
    },
    {
      number: 2,
      title: "AI Generates Your Full Product Listing",
      description: "In seconds, AI prepares everything your store needs:",
      list: [
        "Product title",
        "Long & short descriptions",
        "SEO-optimized meta tags",
        "High-quality images suggestions",
        "Relevant video recommendations",
      ],
      icon: <Wand2 size={48} className="text-[#89D6AE]" />,
      align: "right",
    },
    {
      number: 3,
      title: "Review & Customize (Optional)",
      description: "Make quick edits if you want:",
      list: [
        "Tone of description",
        "Keywords",
        "Title length",
        "Media selection",
      ],
      icon: <PenTool size={48} className="text-[#89D6AE]" />,
      align: "left",
    },
    {
      number: 4,
      title: "Publish to Your e-Commerce Store",
      description: "Your Shopify or WooCommerce store and publish in.",
      icon: <ShoppingCart size={48} className="text-[#89D6AE]" />,
      align: "right",
    },
  ];

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      {/* Background grid effect (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00A64C 1px, transparent 1px), linear-gradient(90deg, #00A64C 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-[#00A64C] text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Upload your product image and let our AI handle everything — from description to SEO-ready content — with just a single click.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-100 hidden md:block"></div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center gap-12 md:gap-0 ${step.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Content Side */}
                <div className="w-full md:w-1/2 flex flex-col px-4 md:px-12">
                  <div className={`flex flex-col ${step.align === 'left' ? 'items-start text-left' : 'items-start text-left'}`}>
                    <div className="w-10 h-10 rounded-full bg-[#89D6AE] text-white flex items-center justify-center font-bold mb-6">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.description}</p>
                    
                    {step.list && (
                      <ul className="space-y-1">
                        {step.list.map((item, i) => (
                          <li key={i} className="text-gray-500 text-sm flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Icon Side */}
                <div className="w-full md:w-1/2 flex justify-center items-center px-4">
                  <div className="p-8 rounded-full border-2 border-gray-50 bg-white shadow-sm">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;