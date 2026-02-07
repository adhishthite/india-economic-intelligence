import { NextResponse } from "next/server";
import {
	getData,
	getDatasetOverview,
	getIndicators,
	getMetadata,
} from "@/lib/mcp-client";

export const maxDuration = 30;
export const runtime = "nodejs";

interface DataRequestBody {
	action: "overview" | "indicators" | "metadata" | "data";
	dataset?: string;
	dataset_code?: string; // backward compat
	indicator_code?: number;
	filters?: Record<string, string>;
	base_year?: string;
	level?: string;
	frequency?: string;
	frequency_code?: number;
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as DataRequestBody;
		const dataset = body.dataset || body.dataset_code || "";

		switch (body.action) {
			case "overview": {
				const result = await getDatasetOverview();
				return NextResponse.json({ data: result });
			}

			case "indicators": {
				if (!dataset) {
					return NextResponse.json(
						{ error: "dataset required" },
						{ status: 400 },
					);
				}
				const result = await getIndicators(dataset);
				return NextResponse.json({ data: result });
			}

			case "metadata": {
				if (!dataset) {
					return NextResponse.json(
						{ error: "dataset required" },
						{ status: 400 },
					);
				}
				const extra: Record<string, unknown> = {};
				if (body.base_year) extra.base_year = body.base_year;
				if (body.level) extra.level = body.level;
				if (body.frequency) extra.frequency = body.frequency;
				if (body.frequency_code !== undefined)
					extra.frequency_code = body.frequency_code;

				const result = await getMetadata(
					dataset,
					body.indicator_code,
					Object.keys(extra).length > 0 ? extra : undefined,
				);
				return NextResponse.json({ data: result });
			}

			case "data": {
				if (!dataset) {
					return NextResponse.json(
						{ error: "dataset required" },
						{ status: 400 },
					);
				}
				const result = await getData(dataset, body.filters || {});
				return NextResponse.json({ data: result });
			}

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
