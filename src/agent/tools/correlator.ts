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

function pearsonCorrelation(x: number[], y: number[]): number {
	const n = x.length;
	if (n < 2) return 0;

	const meanX = x.reduce((a, b) => a + b, 0) / n;
	const meanY = y.reduce((a, b) => a + b, 0) / n;

	let numerator = 0;
	let denomX = 0;
	let denomY = 0;

	for (let i = 0; i < n; i++) {
		const dx = x[i] - meanX;
		const dy = y[i] - meanY;
		numerator += dx * dy;
		denomX += dx * dx;
		denomY += dy * dy;
	}

	const denom = Math.sqrt(denomX * denomY);
	if (denom === 0) return 0;

	return numerator / denom;
}

function interpretCorrelation(r: number): string {
	const absR = Math.abs(r);
	const direction = r > 0 ? "positive" : "negative";

	if (absR > 0.8) return `Strong ${direction} correlation`;
	if (absR > 0.6) return `Moderate ${direction} correlation`;
	if (absR > 0.4) return `Weak ${direction} correlation`;
	if (absR > 0.2) return `Very weak ${direction} correlation`;
	return "No meaningful correlation";
}

export const correlateTool = tool(
	async ({ dataset1_data, dataset2_data, dataset1_name, dataset2_name }) => {
		const data1 = parseDataPoints(dataset1_data);
		const data2 = parseDataPoints(dataset2_data);

		// Match by period
		const periods1 = new Map(data1.map((d) => [d.period, d.value]));
		const matched: Array<{
			period: string;
			value1: number;
			value2: number;
		}> = [];

		for (const entry of data2) {
			const val1 = periods1.get(entry.period);
			if (val1 !== undefined) {
				matched.push({
					period: entry.period,
					value1: val1,
					value2: entry.value,
				});
			}
		}

		if (matched.length < 3) {
			return JSON.stringify({
				error: "Insufficient overlapping data points for correlation analysis",
				matchedPeriods: matched.length,
				dataset1Periods: data1.map((d) => d.period),
				dataset2Periods: data2.map((d) => d.period),
			});
		}

		const x = matched.map((m) => m.value1);
		const y = matched.map((m) => m.value2);
		const correlation = pearsonCorrelation(x, y);

		return JSON.stringify(
			{
				dataset1: dataset1_name,
				dataset2: dataset2_name,
				correlation: Math.round(correlation * 1000) / 1000,
				interpretation: interpretCorrelation(correlation),
				matchedDataPoints: matched.length,
				dataPoints: matched,
			},
			null,
			2,
		);
	},
	{
		name: "correlate_datasets",
		description:
			"Calculate Pearson correlation between two datasets. Both inputs should be JSON arrays of data points with period and value fields. Use this to find relationships between economic indicators (e.g., CPI inflation vs unemployment rate).",
		schema: z.object({
			dataset1_data: z.string().describe("JSON array string of first dataset"),
			dataset2_data: z.string().describe("JSON array string of second dataset"),
			dataset1_name: z.string().describe("Name/label for the first dataset"),
			dataset2_name: z.string().describe("Name/label for the second dataset"),
		}),
	},
);

export const correlatorTools = [correlateTool];
