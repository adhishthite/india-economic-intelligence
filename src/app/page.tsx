"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { ChartRenderer } from "@/components/chart-renderer";
import type { ChartData } from "@/lib/types";

const STARTER_QUESTIONS = [
	"What is India's current unemployment rate?",
	"Compare GDP growth across the last 5 years",
	"Which states have the highest inflation?",
	"Is there a correlation between industrial output and employment?",
];

function extractCharts(content: string): {
	text: string;
	charts: ChartData[];
} {
	const charts: ChartData[] = [];
	const chartRegex = /```chart\n([\s\S]*?)```/g;
	let match: RegExpExecArray | null;

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

	const text = content.replace(chartRegex, "").trim();
	return { text, charts };
}

interface MessagePart {
	type: string;
	text?: string;
	reasoning?: string;
}

function getTextFromMessage(parts: MessagePart[]): string {
	return parts
		.filter((p) => p.type === "text" && p.text)
		.map((p) => p.text ?? "")
		.join("\n");
}

function getReasoningFromMessage(parts: MessagePart[]): string {
	return parts
		.filter((p) => p.type === "reasoning" && p.reasoning)
		.map((p) => p.reasoning ?? "")
		.join("\n");
}

export default function Home() {
	const { messages, sendMessage, status, stop } = useChat();

	const isStreaming = status === "streaming" || status === "submitted";
	const isEmpty = messages.length === 0;

	const handleSuggestionClick = useCallback(
		(suggestion: string) => {
			sendMessage({ text: suggestion });
		},
		[sendMessage],
	);

	const handlePromptSubmit = useCallback(
		(message: { text: string }) => {
			if (!message.text.trim()) return;
			sendMessage({ text: message.text });
		},
		[sendMessage],
	);

	return (
		<div className="flex h-[calc(100vh-3.5rem)] flex-col">
			{isEmpty ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
					<div className="text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 backdrop-blur-sm">
							<svg
								className="h-8 w-8 text-amber-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.5}
							>
								<title>Analytics</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-100">
							India Economic Intelligence
						</h2>
						<p className="mt-2 text-sm text-gray-400">
							AI-powered economic analysis using live MoSPI government data.
							<br />
							Ask about GDP, inflation, employment, industrial output, and more.
						</p>
					</div>
					<Suggestions className="justify-center">
						{STARTER_QUESTIONS.map((q) => (
							<Suggestion
								key={q}
								suggestion={q}
								onClick={handleSuggestionClick}
								className="border-white/10 bg-white/5 text-gray-300 hover:border-amber-500/30 hover:bg-white/10 hover:text-gray-100"
							/>
						))}
					</Suggestions>
				</div>
			) : (
				<Conversation className="flex-1">
					<ConversationContent className="mx-auto max-w-3xl gap-6">
						{messages.map((msg, index) => {
							const parts = msg.parts as MessagePart[];
							const rawText = getTextFromMessage(parts);
							const reasoning = getReasoningFromMessage(parts);
							const isLastAssistant =
								msg.role === "assistant" && index === messages.length - 1;
							const isCurrentlyStreaming = isStreaming && isLastAssistant;
							const { text, charts } = extractCharts(rawText);

							return (
								<Message key={msg.id} from={msg.role}>
									<MessageContent>
										{msg.role === "user" ? (
											<p className="text-sm leading-relaxed">{rawText}</p>
										) : (
											<>
												{reasoning && (
													<Reasoning className="mb-3">
														<ReasoningTrigger>
															<span className="text-xs text-amber-400">
																{isCurrentlyStreaming && !text
																	? "⏳ Fetching data..."
																	: "🔧 Data sources used"}
															</span>
														</ReasoningTrigger>
														<ReasoningContent>{reasoning}</ReasoningContent>
													</Reasoning>
												)}
												{text ? (
													<MessageResponse>{text}</MessageResponse>
												) : isCurrentlyStreaming ? (
													<div className="flex items-center gap-2 text-sm text-gray-400">
														<span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-amber-400" />
														<span>Analyzing data...</span>
													</div>
												) : null}
												{isCurrentlyStreaming && text && (
													<span className="mt-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-amber-400" />
												)}
											</>
										)}
									</MessageContent>
									{charts.length > 0 && (
										<div className="mt-2 space-y-2">
											{charts.map((chart, i) => (
												<ChartRenderer
													key={`chart-${chart.title}-${i}`}
													chart={chart}
												/>
											))}
										</div>
									)}
								</Message>
							);
						})}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
			)}
			<div className="border-t border-white/10 bg-gray-950/80 px-4 py-3 backdrop-blur-xl">
				<div className="mx-auto max-w-3xl">
					<PromptInput
						onSubmit={handlePromptSubmit}
						className="border-white/10 bg-white/5"
					>
						<PromptInputTextarea placeholder="Ask about India's economy..." />
						<PromptInputFooter>
							<div />
							<PromptInputSubmit
								status={status}
								onStop={stop}
								className="bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400"
							/>
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}
