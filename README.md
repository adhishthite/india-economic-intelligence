# 🧠 India Economic Intelligence

> AI-powered economic analyst for India — powered by live government data from the Ministry of Statistics & Programme Implementation (MoSPI).

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://india-economic-intelligence.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

Ask questions in natural language. Get answers backed by real government statistics — not hallucinated numbers.

## ✨ Features

### 💬 AI Chat Interface
- **Natural language queries** — ask about GDP, inflation, unemployment, industrial output, energy, and more
- **Real-time streaming** — responses stream token-by-token as the AI thinks
- **Tool call visibility** — see exactly which government datasets are being queried in real-time
- **Inline citations** — every data point is traceable to its MoSPI source
- Built with [Vercel AI Elements](https://github.com/vercel/ai-elements) + [shadcn/ui](https://ui.shadcn.com)

### 📊 Live Government Data (7 Datasets)
| Dataset | Description | Examples |
|---------|-------------|----------|
| **PLFS** | Periodic Labour Force Survey | Unemployment rate, LFPR, wages, worker distribution |
| **CPI** | Consumer Price Index | Retail inflation by sector, state, item group |
| **WPI** | Wholesale Price Index | Wholesale commodity prices, producer inflation |
| **IIP** | Index of Industrial Production | Manufacturing output, mining, electricity |
| **NAS** | National Accounts Statistics | GDP, GVA, sector-wise economic growth |
| **ASI** | Annual Survey of Industries | Factory-level statistics (57+ indicators) |
| **ENERGY** | Energy Statistics | Production, consumption, supply-demand balance |

### 🔍 AI Analysis Capabilities
- **Trend analysis** — year-over-year changes, growth rates
- **Cross-dataset correlation** — e.g., "Is there a link between inflation and unemployment?"
- **Anomaly detection** — flag unusual data points
- **State-wise comparisons** — regional breakdowns where available
- **Time-series analysis** — historical patterns and trajectories

### 🏗️ Architecture
- **LangGraph.js** agent with specialized MCP tools
- **MoSPI MCP Server** — direct connection to government statistics API
- **Rate-limited & cached** — respects API limits, caches responses for performance
- **Streaming** — Vercel AI SDK data stream protocol
- **Azure OpenAI** — GPT-4o for reliable tool calling

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) API access with a GPT-4o deployment
- Node.js 18+ (for Next.js)

### Setup

```bash
# Clone the repository
git clone https://github.com/adhishthite/india-economic-intelligence.git
cd india-economic-intelligence

# Install dependencies
bun install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Azure OpenAI credentials

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to start asking questions.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_OPENAI_API_KEY` | ✅ | Your Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | ✅ | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | ✅ | Deployment name (e.g., `gpt-4o`) |
| `KV_REST_API_URL` | ❌ | Vercel KV / Upstash Redis URL (for persistent cache) |
| `KV_REST_API_TOKEN` | ❌ | Vercel KV / Upstash Redis token |

> **Note:** Without Vercel KV configured, the app uses in-memory caching which resets on restart. This is fine for development and demos.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript (strict mode)
- **AI Agent:** [LangGraph.js](https://github.com/langchain-ai/langgraphjs) + [LangChain.js](https://github.com/langchain-ai/langchainjs)
- **LLM:** Azure OpenAI (GPT-4o)
- **Streaming:** [Vercel AI SDK](https://sdk.vercel.ai/)
- **UI Components:** [Vercel AI Elements](https://github.com/vercel/ai-elements) + [shadcn/ui](https://ui.shadcn.com)
- **Data Source:** [MoSPI MCP Server](https://github.com/nso-india/esankhyiki-mcp)
- **Cache:** Vercel KV (Upstash Redis) with in-memory fallback
- **Styling:** Tailwind CSS
- **Package Manager:** Bun
- **Lint/Format:** Biome

## 📐 How It Works

```
User Question
    ↓
LangGraph Agent (GPT-4o)
    ↓
Tool Selection → Which MoSPI dataset(s) to query?
    ↓
MCP Fetcher Tools → 4-step MoSPI workflow:
    1. Dataset overview
    2. Get indicators
    3. Get metadata (filter values)
    4. Fetch data
    ↓
Analyzer/Correlator Tools → Trends, anomalies, cross-dataset analysis
    ↓
Streaming Response → Markdown + insights + source citations
```

The agent follows MoSPI's strict 4-step workflow: you can't skip steps or guess parameter values. Every filter code comes from the metadata step, ensuring data accuracy.

## 📋 Example Queries

- "What is India's current unemployment rate?"
- "Compare GDP growth across the last 5 years"
- "Which states have the highest CPI inflation?"
- "Show me the trend in industrial production since 2015"
- "Is there a correlation between wholesale and consumer inflation?"
- "What's the labor force participation rate for women?"
- "How has energy consumption changed over the last decade?"

## ⚠️ Disclaimers

### Data Accuracy
- All data is sourced **directly from the MoSPI API** — the official statistics arm of the Government of India
- Data is fetched in real-time (with caching for performance) and is **not stored, modified, or curated** by this application
- The AI agent may occasionally misinterpret data or provide incorrect analysis — **always verify critical decisions with official MoSPI publications**
- Data availability depends on MoSPI's publication schedule — some datasets may have delays of weeks or months

### AI Limitations
- The AI agent (GPT-4o) generates analysis based on the data it retrieves — it can make mistakes in interpretation
- Cross-dataset correlations are statistical observations, **not causal claims**
- The agent may not always retrieve the most relevant data for ambiguous queries — be specific
- Complex multi-step queries may take 15-30 seconds due to sequential MoSPI API calls with rate limiting

### API & Infrastructure
- The MoSPI MCP server (`mcp.mospi.gov.in`) is a **government service** — availability is not guaranteed
- Rate limiting is enforced: the app uses shared sessions and 1.5s delays between API calls
- First requests may be slow (~30-60s) while MoSPI sessions are initialized and data is fetched
- Subsequent requests for the same data are faster due to caching (1-24 hours depending on data type)

### Not Official
- This is an **independent open-source project** and is **not affiliated with, endorsed by, or connected to** the Ministry of Statistics & Programme Implementation (MoSPI) or the Government of India
- For official statistics, visit [mospi.gov.in](https://mospi.gov.in)

## 🔒 Privacy & Security

- **No data collection** — this app does not collect, store, or transmit any user data
- **No analytics or tracking** — no third-party scripts, no cookies
- **Environment variables** are never committed to the repository (`.env*` is gitignored)
- All API communication happens server-side — your Azure OpenAI key is never exposed to the client

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Development

```bash
# Lint & format
bunx @biomejs/biome check --write .

# Type check
bun run build

# Run dev server
bun run dev
```

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MoSPI](https://mospi.gov.in) & [NSO India](https://github.com/nso-india) for the open MCP server providing free access to government statistics
- [Vercel](https://vercel.com) for Next.js, AI SDK, and AI Elements
- [LangChain](https://langchain.com) for LangGraph.js

---

**Built by [Adhish Thite](https://github.com/adhishthite)** · [Twitter](https://x.com/xadhish) · [LinkedIn](https://linkedin.com/in/adhish-thite)
