# The Gold Metrics

> **"Timeless Value. Infinite Intelligence."**
> The definitive instrument for the modern investor. Precision market data fused with sovereign-grade AI analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-0.1.0-gold)

## 🏗 Architecture Decisions

We deliberately chose a **Modular Monolith** architecture over Microservices to prioritize velocity and coherence.

* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) - Handles both Frontend and Serverless Backend.
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) - Using a custom "Gold" design system defined in native CSS variables.
* **Database:** [Supabase](https://supabase.com/) - PostgreSQL for structured data.
* **AI Engine:** [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/) - Selected for high-throughput context processing and structured JSON output capabilities.
* **Orchestration:** [LangChain.js](https://js.langchain.com/) - Manages the "Analyst" agent workflows.

## 📂 Project Structure

We follow a `src` directory pattern with strict separation of concerns:

```bash
src/
├── app/               # Next.js App Router (Pages & API Routes)
├── lib/               # Business Logic & External Adapters
│   ├── ai/            # Gemini/LangChain configuration
│   ├── gold/          # MetalPriceAPI & Data normalization
│   └── social/        # X (Twitter) & Threads clients
├── types/             # Shared TypeScript Interfaces
└── styles/            # Global CSS & Tailwind Theme
