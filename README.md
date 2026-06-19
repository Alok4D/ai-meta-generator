# AI Meta Generator ✨

Welcome to **AI Meta Generator** — a powerful, modern, and feature-rich monorepo application designed to streamline high-quality AI background removal, image processing, AI generation, and asset management for creators, marketers, and developers.

Built with cutting-edge web technologies, this platform offers a stunning **Glassmorphism UI** with seamless interactions, backed by a robust Node.js API and a dedicated Python AI Microservice.

### 🌐 Live Links
* **Frontend Application**: [https://metagen-ai-bd.vercel.app](https://metagen-ai-bd.vercel.app)
* **AI Microservice API (HuggingFace)**: [https://alok561-bg-remover-api.hf.space](https://alok561-bg-remover-api.hf.space)

![AI Meta Generator Banner](apps/web/public/image.png)

---

## ✨ Recent Enhancements
* **High-Watermark Credit Top-up System**: Advanced payment logic across Stripe and Manual payments. If a user buys a lower-tier plan while on a premium tier, the system intelligently retains their premium status while stacking their new credits, preventing accidental downgrades.
* **Dynamic Batch Processing Limits**: Batch upload capacities are now dynamically tied to subscription plans (e.g., Lite: 50, Pro: 100, Unlimited: 500) for better resource management.
* **Premium Skeleton Loading UI**: Completely revamped the pending/processing states during AI generation with beautiful, structural shimmer effects (skeleton loaders) to match the final output layout.
* **History Pagination**: Improved performance and UX in the Generation History page with smooth client-side pagination.
* **Professional Iconography**: Upgraded dashboard navigation icons with more contextual and premium SVGs.

---

## 🚀 Key Features

### 🎨 Creative Tools
* **AI Background Remover (Full-Stack)**: An advanced, machine-learning powered background removal tool featuring a highly interactive frontend and a dedicated Python microservice:
  * **Frontend UI/UX Features**:
    * **Interactive Comparison Slider**: A beautiful, touch-friendly "Before & After" image slider to instantly preview the background removal results.
    * **Drag-and-Drop Zone**: Seamless file upload experience with visual feedback.
    * **Advanced Settings Panel**: Users can fine-tune the AI output using Alpha Matting, Foreground Threshold, and Erode Size controls for pixel-perfect edges.
    * **Dynamic Downloader**: Export the processed image in multiple formats (`PNG`, `JPG`, `WEBP`) with custom filename prefixes directly from the UI.
    * **Glassmorphism Design**: Sleek, modern, and responsive UI built with Tailwind CSS and Framer Motion animations.
  * **Backend AI Models** (Hosted on HuggingFace Spaces):
    * **BiRefNet (1GB)**: Best for complex edges, fine details, and hair.
    * **IS-Net General Use (176MB)**: Excellent default for general objects.
    * **U2Net Human Seg**: Specialized for human portraits.
    * **U2Net Cloth Seg**: Specialized for clothing apparel.
    * **U2Netp (4MB)**: Lightweight, fast model for low-resource environments.
* **AI Meta/Image Generator**: Leverage advanced AI models (Vision/LLMs via OpenRouter/Gemini) to analyze images and generate high-quality metadata, captions, and descriptions.
* **Batch Image Converter**: A powerful, 100% offline client-side converter. Upload multiple images and instantly convert them between `JPG`, `PNG`, `WEBP`, `AVIF`, and `PDF`.
* **Trace to Vector (SVG)**: Convert raster images (JPG/PNG) into pure mathematical SVG vectors using advanced geometric tracing algorithms—all happening locally in your browser.
* **Color Palette Extractor**: Instantly extract beautiful, harmonious color palettes and HEX codes from any uploaded image using intelligent color sampling.

### 📊 Management & Dashboard
* **Marketing Events Calendar**: Stay ahead of the curve with a built-in calendar tracking important global and marketing events.
* **Generation History**: A dedicated log to track, manage, and re-download all your previously generated assets and AI responses.
* **Batch Processing**: Handle multiple assets simultaneously to drastically improve your workflow efficiency.

### 🔐 Security & User Management
* **Secure Authentication**: Robust JWT-based Login and Registration system with encrypted password management.
* **Advanced Forgot Password Flow**: Built-in specialized OTP routing to independently handle password resets versus account verification, ensuring maximum security.
* **Role-Based Access Control (RBAC)**: 
  * **User Dashboard**: A personalized space for clients to generate and manage their assets.
  * **Admin Panel**: A restricted, secure layout for administrators to manage users and platform metrics.
* **Cloud Storage Integration**: Seamless connection with Cloudinary for fast, reliable, and optimized image hosting.

### 💳 Monetization & Subscriptions
* **Automated Payments**: Seamless integration with Stripe Checkout for instant plan upgrades and recurring subscriptions.
* **Clean Session Handling**: Intelligent URL parsing and history management to prevent duplicate success popups and maintain a seamless user experience during checkout.
* **Manual Local Payments**: Dedicated system for users to pay via mobile banking (bKash/Nagad) with TrxID submission.
* **Admin Verification Portal**: Administrators can easily review, approve, or reject pending manual payments.
* **Dynamic Pricing UI**: Beautiful, interactive pricing tables that automatically highlight active plans and provide contextual tooltips.
* **Subscription Management**: Users can cancel their subscriptions anytime and automatically fallback to a free tier.
* **Advanced Transaction History**: Comprehensive payment logs for both Users and Admins, featuring real-time search, plan filtering, status filtering, and custom shadcn deletion modals.

### ⚡ Infrastructure & Deployment
* **Multi-Cloud Architecture**:
  * **Frontend**: Hosted on **Vercel** for edge-optimized performance.
  * **Main Backend (Node.js)**: API hosted on cloud providers (e.g. Render) for robust database and authentication management.
  * **AI Microservice (Python)**: Hosted on **HuggingFace Spaces** (16GB RAM / 2 vCPUs) to smoothly execute heavy Machine Learning models (like the 1GB BiRefNet) completely for free without Out-of-Memory crashes.
* **Serverless Email Proxy**: Custom Vercel Next.js API route functioning as a secure proxy to bypass strict SMTP port blockages on free-tier backend hosting (like Render), ensuring guaranteed email delivery for OTPs and notifications.

---

## 🛠️ Technology Stack

This project is structured as a highly scalable **Turborepo Monorepo**, ensuring maximum performance and code reusability.

**Frontend (`apps/web`)**
* **Framework**: Next.js 14+ (App Router)
* **Styling**: Tailwind CSS & Vanilla CSS
* **UI Components**: Shadcn UI & Radix UI primitives
* **Animations**: Framer Motion & Tailwind Animate
* **State Management**: Redux Toolkit (RTK) & RTK Query
* **Icons**: Lucide React

**Main Backend (`apps/api`)**
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB (Mongoose)
* **Authentication**: JWT (JSON Web Tokens)
* **Email Service**: Hostinger SMTP Integration

**AI Microservice (`apps/bg-remover-service`)**
* **Runtime**: Python 3.10
* **Framework**: FastAPI & Uvicorn
* **AI Engine**: `rembg` (ONNX Runtime)
* **Image Processing**: Pillow (PIL)

**Tooling & Shared Packages**
* **Monorepo**: Turborepo
* **Language**: 100% TypeScript
* **Linting/Formatting**: ESLint & Prettier
* **Shared UI**: `@repo/ui` package for cross-app components

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ai-meta-generator
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Configure your `.env` file in the `apps/api` and `apps/web` directories (Database URIs, JWT Secrets, AI API Keys, Cloudinary credentials).

4. **Run the Development Server:**
   ```bash
   pnpm run dev
   ```
   * The Frontend will be available at `http://localhost:3000`
   * The Backend API will be available at `http://localhost:5000`

---

## 📁 Project Structure

```text
ai-meta-generator/
├── apps/
│   ├── web/               # Next.js Frontend Application
│   │   ├── app/           # App Router (Dashboard, Admin, Auth, Landing)
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Redux slices, RTK Query API, Utilities
│   ├── api/               # Node.js Express Backend
│   │   ├── src/           # Controllers, Routes, Models, Middleware
│   │   └── .env           # Server configuration
│   └── bg-remover-service/# Python FastAPI Microservice for AI models
│       ├── main.py        # FastAPI server & inference logic
│       ├── Dockerfile     # HuggingFace Spaces deployment config
│       └── requirements.txt
├── packages/
│   ├── ui/                # Shared React components library
│   ├── eslint-config/     # Shared linting rules
│   └── typescript-config/ # Shared TS configurations
└── turbo.json             # Turborepo pipeline configuration
```

---
*Designed with ❤️ for a modern, premium web experience.*
