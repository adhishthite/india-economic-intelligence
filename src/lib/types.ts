export interface MCPSession {
	sessionId: string;
	createdAt: number;
}

export interface MCPToolCallParams {
	method: string;
	params: Record<string, unknown>;
}

export interface MCPToolResult {
	content: Array<{ type: string; text: string }>;
	structuredContent?: Record<string, unknown>;
}

export interface DatasetInfo {
	name: string;
	code: string;
	description: string;
	indicators: string[];
}

export interface IndicatorData {
	indicator_name: string;
	indicator_code: string;
	values: DataPoint[];
	metadata?: Record<string, unknown>;
	source: string;
}

export interface DataPoint {
	period: string;
	value: number;
	unit?: string;
}

export interface ChartData {
	type: "line" | "bar" | "area";
	title: string;
	xKey: string;
	yKeys: string[];
	data: Record<string, unknown>[];
	source: string;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	charts?: ChartData[];
	sources?: string[];
	timestamp: number;
}

export interface CorrelationResult {
	dataset1: string;
	dataset2: string;
	indicator1: string;
	indicator2: string;
	correlation: number;
	dataPoints: Array<{
		period: string;
		value1: number;
		value2: number;
	}>;
	interpretation: string;
}

export interface DashboardCard {
	title: string;
	value: string;
	change?: string;
	changeDirection?: "up" | "down" | "flat";
	source: string;
	dataset: string;
}
