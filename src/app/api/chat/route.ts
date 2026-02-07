import type { BaseMessage } from "@langchain/core/messages";
import {
	AIMessage,
	HumanMessage,
	type ToolMessage,
} from "@langchain/core/messages";
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import { createAgent } from "@/agent/graph";

export const maxDuration = 120;
export const runtime = "nodejs";

interface ChatRequestBody {
	id?: string;
	messages: UIMessage[];
}

function extractTextFromParts(msg: UIMessage): string {
	if (!msg.parts || msg.parts.length === 0) return "";
	return msg.parts
		.filter((p) => p.type === "text")
		.map((p) => (p as { type: "text"; text: string }).text)
		.join("\n");
}

export async function POST(request: Request) {
	const body = (await request.json()) as ChatRequestBody;
	const { messages } = body;

	if (!messages || messages.length === 0) {
		return new Response(JSON.stringify({ error: "No messages provided" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const langchainMessages: BaseMessage[] = messages.map((msg) => {
		const text = extractTextFromParts(msg);
		if (msg.role === "assistant") {
			return new AIMessage(text);
		}
		return new HumanMessage(text);
	});

	const agent = createAgent();

	const stream = createUIMessageStream({
		execute: async ({ writer }) => {
			const textPartId = "text-main";
			const reasoningPartId = "reasoning-main";

			try {
				console.log("[chat] Starting agent stream...");

				// Use updates mode to get granular events
				const agentStream = await agent.stream(
					{ messages: langchainMessages },
					{ recursionLimit: 20, streamMode: "updates" },
				);

				let textStarted = false;
				let reasoningStarted = false;
				let lastAiContent = "";

				for await (const event of agentStream) {
					// event has node name as key, value is the state update
					for (const [nodeName, nodeOutput] of Object.entries(event)) {
						// biome-ignore lint/suspicious/noExplicitAny: LangGraph event structure varies
						const output = nodeOutput as any;
						const msgs = output?.messages as BaseMessage[] | undefined;
						if (!msgs) continue;

						for (const msg of msgs) {
							const msgType = msg._getType();

							if (msgType === "ai") {
								const aiMsg = msg as AIMessage;

								// Check for tool calls — show as reasoning
								if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
									for (const toolCall of aiMsg.tool_calls) {
										if (!reasoningStarted) {
											writer.write({
												type: "reasoning-start",
												id: reasoningPartId,
											});
											reasoningStarted = true;
										}
										const toolInfo = `🔧 Calling: ${toolCall.name}(${JSON.stringify(toolCall.args).slice(0, 150)})\n`;
										writer.write({
											type: "reasoning-delta",
											delta: toolInfo,
											id: reasoningPartId,
										});
									}
								}

								// Stream text content
								if (aiMsg.content && typeof aiMsg.content === "string") {
									const newContent = aiMsg.content;
									if (newContent && newContent !== lastAiContent) {
										// Close reasoning before text starts
										if (reasoningStarted) {
											writer.write({
												type: "reasoning-end",
												id: reasoningPartId,
											});
											reasoningStarted = false;
										}

										if (!textStarted) {
											writer.write({
												type: "text-start",
												id: textPartId,
											});
											textStarted = true;
										}

										// Send the full new content or delta
										const delta = lastAiContent
											? newContent.slice(lastAiContent.length)
											: newContent;
										if (delta) {
											writer.write({
												type: "text-delta",
												delta,
												id: textPartId,
											});
										}
										lastAiContent = newContent;
									}
								}
							}

							if (msgType === "tool") {
								const toolMsg = msg as ToolMessage;
								if (!reasoningStarted) {
									writer.write({
										type: "reasoning-start",
										id: reasoningPartId,
									});
									reasoningStarted = true;
								}
								// Show truncated tool result
								const resultStr =
									typeof toolMsg.content === "string"
										? toolMsg.content
										: JSON.stringify(toolMsg.content);
								const truncated =
									resultStr.length > 200
										? `${resultStr.slice(0, 200)}...`
										: resultStr;
								writer.write({
									type: "reasoning-delta",
									delta: `✅ Result: ${truncated}\n\n`,
									id: reasoningPartId,
								});
							}
						}
					}
				}

				if (reasoningStarted) {
					writer.write({ type: "reasoning-end", id: reasoningPartId });
				}
				if (textStarted) {
					writer.write({ type: "text-end", id: textPartId });
				}

				console.log("[chat] Stream complete");
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				console.error("[chat] Agent error:", errorMessage);
				writer.write({
					type: "error",
					errorText: errorMessage,
				});
			}
		},
	});

	return createUIMessageStreamResponse({ stream });
}
