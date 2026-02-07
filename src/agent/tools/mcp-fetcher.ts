import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
	fetchMoSPIData,
	getData,
	getDatasetOverview,
	getIndicators,
	getMetadata,
} from "@/lib/mcp-client";

export const datasetOverviewTool = tool(
	async () => {
		const result = await getDatasetOverview();
		return JSON.stringify(result, null, 2);
	},
	{
		name: "get_dataset_overview",
		description:
			"Step 1: Get an overview of all available MoSPI datasets (PLFS, CPI, WPI, IIP, NAS, ASI, ENERGY). MUST call this first before any other data tool.",
		schema: z.object({}),
	},
);

export const getIndicatorsTool = tool(
	async ({ dataset, user_query }) => {
		const result = await getIndicators(dataset, user_query || undefined);
		return JSON.stringify(result, null, 2);
	},
	{
		name: "get_indicators",
		description:
			"Step 2: Get available indicators for a dataset. MUST call get_dataset_overview first. Pass the user's original question as user_query.",
		schema: z.object({
			dataset: z
				.string()
				.describe("Dataset name: PLFS, CPI, WPI, IIP, NAS, ASI, or ENERGY"),
			user_query: z
				.string()
				.optional()
				.describe("The user's original question for context"),
		}),
	},
);

export const getMetadataTool = tool(
	async ({
		dataset,
		indicator_code,
		base_year,
		level,
		frequency,
		frequency_code,
		classification_year,
		series,
	}) => {
		const extra: Record<string, unknown> = {};
		if (base_year) extra.base_year = base_year;
		if (level) extra.level = level;
		if (frequency) extra.frequency = frequency;
		if (frequency_code !== undefined) extra.frequency_code = frequency_code;
		if (classification_year) extra.classification_year = classification_year;
		if (series) extra.series = series;

		const result = await getMetadata(
			dataset,
			indicator_code,
			Object.keys(extra).length > 0 ? extra : undefined,
		);
		return JSON.stringify(result, null, 2);
	},
	{
		name: "get_metadata",
		description:
			"Step 3: Get filter options for a dataset/indicator. MUST call get_indicators first. MUST call this before get_data. Returns valid filter values (states, years, quarters, etc.).",
		schema: z.object({
			dataset: z
				.string()
				.describe("Dataset name: PLFS, CPI, WPI, IIP, NAS, ASI, or ENERGY"),
			indicator_code: z
				.number()
				.optional()
				.describe(
					"Indicator code (integer) from get_indicators. Required for PLFS, NAS, ENERGY.",
				),
			base_year: z
				.string()
				.optional()
				.describe(
					"Required for CPI (2012/2010), IIP (2011-12/2004-05/1993-94)",
				),
			level: z.string().optional().describe("Required for CPI (Group/Item)"),
			frequency: z
				.string()
				.optional()
				.describe("Required for IIP (Annually/Monthly)"),
			frequency_code: z
				.number()
				.optional()
				.describe(
					"Required for PLFS (1=Annual, 2=Quarterly, 3=Monthly). Use 1 for most queries.",
				),
			classification_year: z
				.string()
				.optional()
				.describe("Required for ASI (2008/2004/1998/1987)"),
			series: z.string().optional().describe("For NAS only (Current/Back)"),
		}),
	},
);

export const getDataTool = tool(
	async ({ dataset, filters }) => {
		const parsedFilters =
			typeof filters === "string" ? JSON.parse(filters) : filters;
		const result = await getData(dataset, parsedFilters);
		return JSON.stringify(result, null, 2);
	},
	{
		name: "get_data",
		description:
			"Step 4: Fetch actual data. MUST call get_metadata first. Use ONLY filter values from get_metadata (do not guess). Pass filters as key-value pairs using 'id' values from metadata.",
		schema: z.object({
			dataset: z
				.string()
				.describe("Dataset name: PLFS, CPI, WPI, IIP, NAS, ASI, or ENERGY"),
			filters: z
				.union([z.record(z.string(), z.string()), z.string()])
				.describe(
					'Filter key-value pairs from get_metadata, e.g. {"base_year": "2012", "level": "Group"} or a JSON string',
				),
		}),
	},
);

export const fetchFullDatasetTool = tool(
	async ({ dataset, indicator_code, filters }) => {
		const parsedFilters = filters
			? typeof filters === "string"
				? JSON.parse(filters)
				: filters
			: {};
		const result = await fetchMoSPIData(dataset, indicator_code, parsedFilters);
		return JSON.stringify(result, null, 2);
	},
	{
		name: "fetch_full_dataset",
		description:
			"Convenience: runs steps 2→3→4 in sequence. Use when you know the dataset and indicator_code already.",
		schema: z.object({
			dataset: z
				.string()
				.describe("Dataset name: PLFS, CPI, WPI, IIP, NAS, ASI, or ENERGY"),
			indicator_code: z.number().describe("The indicator code (integer)"),
			filters: z
				.union([z.record(z.string(), z.string()), z.string()])
				.optional()
				.describe("Optional filter key-value pairs"),
		}),
	},
);

export const mcpTools = [
	datasetOverviewTool,
	getIndicatorsTool,
	getMetadataTool,
	getDataTool,
	fetchFullDatasetTool,
];
