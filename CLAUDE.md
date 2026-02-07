# CLAUDE.md — India Economic Intelligence

## Project
AI-powered economic analyst for India using live government data via MoSPI MCP server.

## Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Agent:** LangChain.js + LangGraph.js
- **LLM:** Azure OpenAI via `@langchain/openai` (endpoint: your-instance.openai.azure.com)
- **Cache:** Vercel KV (Upstash Redis)
- **Streaming:** Vercel AI SDK
- **Charts:** Recharts (inline in chat responses)
- **Markdown:** react-markdown (for agent responses)
- **Package Manager:** Bun (never npm/npx)
- **Lint/Format:** Biome (never ESLint/Prettier)

## Data Source
- **MoSPI MCP Server:** https://mcp.mospi.gov.in/
- **Transport:** Streamable HTTP (Accept: text/event-stream, application/json)
- **Protocol:** JSON-RPC 2.0 with MCP session management
- **Datasets:** PLFS, CPI, WPI, IIP, NAS, ASI, ENERGY
- **No auth required** — open government data
- **Rate limited** — use shared sessions, 1-1.5s delays between calls, sequential fetching

## MCP Workflow (MUST follow in order)
1. POST initialize → get mcp-session-id header
2. Call `1_know_about_mospi_api` → dataset overview
3. Call `2_get_indicators` → indicators for chosen dataset
4. Call `3_get_metadata` → valid filter values
5. Call `4_get_data` → actual data

Each call includes headers: Accept: text/event-stream, application/json + Content-Type: application/json + mcp-session-id
Response format: SSE with `event: message\ndata: {json}\n\n`

## Architecture
- `/api/chat` — LangGraph agent endpoint (streaming)
- `/api/data` — Direct MoSPI data endpoint (for dashboard views)
- `src/agent/graph.ts` — LangGraph agent with tools
- `src/agent/tools/` — MCP fetcher, correlator, formatter
- `src/cache/redis.ts` — Vercel KV wrapper with TTL

## Agent Tools
1. **mcp-fetcher** — Fetches data from any MoSPI dataset via MCP
2. **correlator** — Cross-dataset correlation analysis (e.g., CPI vs PLFS)
3. **formatter** — Transforms raw data into chart-ready format

## Coding Standards
- TypeScript strict mode
- Biome for lint+format: `bunx @biomejs/biome check --write .`
- No plain JS files
- `bun run build` must pass before committing
- Use `'use client'` only where needed (charts, interactive components)
- Server components by default

## Environment Variables
- `AZURE_OPENAI_API_KEY` — Azure OpenAI key (your Azure instance)
- `AZURE_OPENAI_ENDPOINT` — https://your-instance.openai.azure.com/
- `AZURE_OPENAI_DEPLOYMENT` — gpt-4o or gpt-5.2
- `KV_REST_API_URL` — Vercel KV endpoint
- `KV_REST_API_TOKEN` — Vercel KV token

## Design
- Dark theme, modern, glassmorphism
- Chat interface as primary interaction
- Inline charts in responses
- Source citations for every data point
- Responsive — works on mobile

## MCP Parameter Names (UPDATED)
- Tool `2_get_indicators`: param is `dataset` (NOT `dataset_code`), also accepts `user_query`
- Tool `3_get_metadata`: param is `dataset` (NOT `dataset_code`), `indicator_code` is NUMBER type
- Tool `4_get_data`: takes `{dataset, filters}` where filters is Record<string, string>
- Kimi K2.5 does NOT work with LangChain tool calling (returns reasoning_content instead of content)
- Using gpt-4o for the agent, works great with tool calling
- Non-GPT models on Azure use `/openai/v1/` path (OpenAI-compatible), not `/openai/deployments/`
- Zod v4: `z.record()` needs TWO args: `z.record(z.string(), z.string())`

## Key Learnings from Sister Projects
- MoSPI rate limits aggressively → shared MCP sessions, sequential calls
- protocolVersion must be "2025-03-26"
- PLFS frequency_code=1 for annual (covers all 8 indicators including quarterly via quarter_code)
- CPI needs base_year + level params
- IIP needs base_year + frequency params
- Response data is in `result.structuredContent` or `result.content[0].text` (JSON string)
