"use client";

import ReactMarkdown from "react-markdown";
import type { ChartData } from "@/lib/types";
import { ChartRenderer } from "./chart-renderer";

interface ChatMessageProps {
	role: "user" | "assistant";
	content: string;
	sources?: string[];
	isStreaming?: boolean;
}

function extractCharts(content: string): {
	text: string;
	charts: ChartData[];
} {
	const charts: ChartData[] = [];
	const chartRegex = /```chart\n([\s\S]*?)```/g;
	let match: RegExpExecArray | null;
	let text = content;

	match = chartRegex.exec(content);
	while (match !== null) {
		try {
			const chart = JSON.parse(match[1]) as ChartData;
			charts.push(chart);
		} catch {
			// Skip invalid chart JSON
		}
		match = chartRegex.exec(content);
	}

	text = content.replace(chartRegex, "").trim();
	return { text, charts };
}

export function ChatMessage({
	role,
	content,
	sources,
	isStreaming,
}: ChatMessageProps) {
	const { text, charts } = extractCharts(content);

	if (role === "user") {
		return (
			<div className="flex justify-end">
				<div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-r from-amber-600/80 to-amber-500/80 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
					<p className="text-sm leading-relaxed">{text}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex justify-start">
			<div className="max-w-[85%] space-y-2">
				<div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur-md">
					<div className="prose prose-sm prose-invert max-w-none text-gray-200">
						<ReactMarkdown>{text}</ReactMarkdown>
					</div>
					{isStreaming && (
						<span className="mt-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-amber-400" />
					)}
				</div>
				{charts.map((chart, i) => (
					<ChartRenderer key={`chart-${chart.title}-${i}`} chart={chart} />
				))}
				{sources && sources.length > 0 && (
					<div className="mt-1 flex flex-wrap gap-1.5">
						{sources.map((source) => (
							<span
								key={source}
								className="rounded-full bg-emerald-900/30 px-2.5 py-0.5 text-xs text-emerald-400"
							>
								{source}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
