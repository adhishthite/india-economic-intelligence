import { cacheGet, cacheSet } from "./cache";

const MCP_URL = "https://mcp.mospi.gov.in/";
const RATE_LIMIT_DELAY_MS = 1500;
const PROTOCOL_VERSION = "2025-03-26";

let sharedSession: { sessionId: string; createdAt: number } | null = null;
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSSEResponse(text: string): unknown {
	const lines = text.split("\n");
	for (const line of lines) {
		if (line.startsWith("data: ")) {
			const jsonStr = line.slice(6).trim();
			if (jsonStr) {
				try {
					return JSON.parse(jsonStr);
				} catch {}
			}
		}
	}
	// Try parsing the whole response as JSON
	try {
		return JSON.parse(text);
	} catch {
		throw new Error(`Failed to parse MCP response: ${text.slice(0, 200)}`);
	}
}

async function mcpRequest(
	body: Record<string, unknown>,
	sessionId?: string,
): Promise<{ data: unknown; sessionId: string }> {
	const headers: Record<string, string> = {
		Accept: "text/event-stream, application/json",
		"Content-Type": "application/json",
	};
	if (sessionId) {
		headers["mcp-session-id"] = sessionId;
	}

	const response = await fetch(MCP_URL, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error(
			`MCP request failed: ${response.status} ${response.statusText}`,
		);
	}

	const newSessionId =
		response.headers.get("mcp-session-id") || sessionId || "";
	const text = await response.text();
	const data = parseSSEResponse(text);

	return { data, sessionId: newSessionId };
}

async function getOrCreateSession(): Promise<string> {
	if (sharedSession && Date.now() - sharedSession.createdAt < SESSION_TTL_MS) {
		return sharedSession.sessionId;
	}

	const { sessionId } = await mcpRequest({
		jsonrpc: "2.0",
		id: 1,
		method: "initialize",
		params: {
			protocolVersion: PROTOCOL_VERSION,
			capabilities: {},
			clientInfo: {
				name: "india-economic-intelligence",
				version: "1.0.0",
			},
		},
	});

	sharedSession = { sessionId, createdAt: Date.now() };
	return sessionId;
}

async function callTool(
	sessionId: string,
	toolName: string,
	args: Record<string, unknown>,
	requestId: number = 2,
): Promise<unknown> {
	const { data } = await mcpRequest(
		{
			jsonrpc: "2.0",
			id: requestId,
			method: "tools/call",
			params: {
				name: toolName,
				arguments: args,
			},
		},
		sessionId,
	);

	// biome-ignore lint/suspicious/noExplicitAny: MCP response structure varies
	const result = data as any;
	if (result?.result) {
		if (result.result.structuredContent) {
			return result.result.structuredContent;
		}
		if (result.result.content?.[0]?.text) {
			try {
				return JSON.parse(result.result.content[0].text);
			} catch {
				return result.result.content[0].text;
			}
		}
		return result.result;
	}
	return data;
}

export async function getDatasetOverview(): Promise<unknown> {
	const cacheKey = "mospi:overview";
	const cached = await cacheGet<unknown>(cacheKey);
	if (cached) return cached;

	const sessionId = await getOrCreateSession();
	await sleep(RATE_LIMIT_DELAY_MS);

	const result = await callTool(sessionId, "1_know_about_mospi_api", {}, 2);

	await cacheSet(cacheKey, result, 86400); // 24 hour cache
	return result;
}

export async function getIndicators(
	dataset: string,
	userQuery?: string,
): Promise<unknown> {
	const cacheKey = `mospi:indicators:${dataset}`;
	const cached = await cacheGet<unknown>(cacheKey);
	if (cached) return cached;

	const sessionId = await getOrCreateSession();
	await sleep(RATE_LIMIT_DELAY_MS);

	const result = await callTool(
		sessionId,
		"2_get_indicators",
		{ dataset, user_query: userQuery || null },
		3,
	);

	await cacheSet(cacheKey, result, 86400);
	return result;
}

export async function getMetadata(
	dataset: string,
	indicatorCode?: number,
	extraParams?: Record<string, unknown>,
): Promise<unknown> {
	const cacheKey = `mospi:metadata:${dataset}:${indicatorCode || "all"}`;
	const cached = await cacheGet<unknown>(cacheKey);
	if (cached) return cached;

	const sessionId = await getOrCreateSession();
	await sleep(RATE_LIMIT_DELAY_MS);

	const args: Record<string, unknown> = { dataset };
	if (indicatorCode !== undefined) {
		args.indicator_code = indicatorCode;
	}
	if (extraParams) {
		Object.assign(args, extraParams);
	}

	const result = await callTool(sessionId, "3_get_metadata", args, 4);

	await cacheSet(cacheKey, result, 86400);
	return result;
}

export async function getData(
	dataset: string,
	filters: Record<string, string> = {},
): Promise<unknown> {
	const filterKey = JSON.stringify(filters);
	const cacheKey = `mospi:data:${dataset}:${filterKey}`;
	const cached = await cacheGet<unknown>(cacheKey);
	if (cached) return cached;

	const sessionId = await getOrCreateSession();
	await sleep(RATE_LIMIT_DELAY_MS);

	const result = await callTool(
		sessionId,
		"4_get_data",
		{ dataset, filters },
		5,
	);

	await cacheSet(cacheKey, result, 3600); // 1 hour for actual data
	return result;
}

export async function fetchMoSPIData(
	dataset: string,
	indicatorCode: number,
	filters: Record<string, string> = {},
): Promise<{
	indicators: unknown;
	metadata: unknown;
	data: unknown;
}> {
	const indicators = await getIndicators(dataset);
	await sleep(RATE_LIMIT_DELAY_MS);

	const metadata = await getMetadata(dataset, indicatorCode);
	await sleep(RATE_LIMIT_DELAY_MS);

	const data = await getData(dataset, filters);

	return { indicators, metadata, data };
}
