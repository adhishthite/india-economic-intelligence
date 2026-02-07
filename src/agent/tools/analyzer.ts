import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface DataEntry {
	period: string;
	value: number;
}

function parseDataPoints(dataStr: string): DataEntry[] {
	const data = JSON.parse(dataStr);
	if (Array.isArray(data)) {
		return data.map((d) => ({
			period: String(d.period || d.year || d.date || ""),
			value: Number(d.value || d.amount || 0),
		}));
	}
	return [];
}

function calculateYoYChange(
	data: DataEntry[],
): Array<{ period: string; value: number; yoyChange: number | null }> {
	const sorted = [...data].sort((a, b) => a.period.localeCompare(b.period));
	return sorted.map((entry, i) => ({
		period: entry.period,
		value: entry.value,
		yoyChange:
			i > 0 && sorted[i - 1].value !== 0
				? ((entry.value - sorted[i - 1].value) / sorted[i - 1].value) * 100
				: null,
	}));
}

function detectTrend(data: DataEntry[]): string {
	if (data.length < 2) return "insufficient data";
	const sorted = [...data].sort((a, b) => a.period.localeCompare(b.period));
	const values = sorted.map((d) => d.value);

	let increasing = 0;
	let decreasing = 0;
	for (let i = 1; i < values.length; i++) {
		if (values[i] > values[i - 1]) increasing++;
		else if (values[i] < values[i - 1]) decreasing++;
	}

	const total = values.length - 1;
	if (increasing / total > 0.7) return "strongly increasing";
	if (increasing / total > 0.5) return "moderately increasing";
	if (decreasing / total > 0.7) return "strongly decreasing";
	if (decreasing / total > 0.5) return "moderately decreasing";
	return "fluctuating";
}

function detectAnomalies(
	data: DataEntry[],
): Array<{ period: string; value: number; deviation: number }> {
	if (data.length < 3) return [];
	const values = data.map((d) => d.value);
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const stdDev = Math.sqrt(
		values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length,
	);

	if (stdDev === 0) return [];

	return data
		.filter((d) => Math.abs(d.value - mean) > 2 * stdDev)
		.map((d) => ({
			period: d.period,
			value: d.value,
			deviation: (d.value - mean) / stdDev,
		}));
}

export const analyzeTrendsTool = tool(
	async ({ data }) => {
		const points = parseDataPoints(data);
		const yoyChanges = calculateYoYChange(points);
		const trend = detectTrend(points);
		const anomalies = detectAnomalies(points);

		const values = points.map((p) => p.value);
		const summary = {
			trend,
			dataPoints: points.length,
			min: { value: Math.min(...values), period: "" },
			max: { value: Math.max(...values), period: "" },
			average: values.reduce((a, b) => a + b, 0) / values.length,
			latestValue: points[points.length - 1]?.value,
			yoyChanges: yoyChanges.slice(-5),
			anomalies,
		};

		const minPoint = points.find((p) => p.value === summary.min.value);
		const maxPoint = points.find((p) => p.value === summary.max.value);
		if (minPoint) summary.min.period = minPoint.period;
		if (maxPoint) summary.max.period = maxPoint.period;

		return JSON.stringify(summary, null, 2);
	},
	{
		name: "analyze_trends",
		description:
			"Analyze a time series dataset for trends, year-over-year changes, anomalies, and key statistics. Input is a JSON array string of objects with period and value fields.",
		schema: z.object({
			data: z
				.string()
				.describe(
					'JSON array string of data points, e.g. \'[{"period":"2020","value":4.2}]\'',
				),
		}),
	},
);

export const rankDataTool = tool(
	async ({ data, order }) => {
		const points = parseDataPoints(data);
		const sorted = [...points].sort((a, b) =>
			order === "asc" ? a.value - b.value : b.value - a.value,
		);
		const ranked = sorted.map((d, i) => ({
			rank: i + 1,
			...d,
		}));
		return JSON.stringify(ranked, null, 2);
	},
	{
		name: "rank_data",
		description:
			"Rank data points by value. Useful for finding top/bottom states, sectors, or periods.",
		schema: z.object({
			data: z
				.string()
				.describe("JSON array string of data points with period and value"),
			order: z
				.enum(["asc", "desc"])
				.default("desc")
				.describe("Sort order: desc for highest first, asc for lowest first"),
		}),
	},
);

export const analyzerTools = [analyzeTrendsTool, rankDataTool];
