import { SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { SYSTEM_PROMPT } from "./prompts";
import { analyzerTools } from "./tools/analyzer";
import { correlatorTools } from "./tools/correlator";
import { mcpTools } from "./tools/mcp-fetcher";

function createModel() {
	const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
	const isAzureNative = deployment.startsWith("gpt-");

	const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
	// Extract instance name from endpoint URL (e.g., "https://myinstance.openai.azure.com/" → "myinstance")
	const instanceName = endpoint.match(/https?:\/\/([^.]+)\./)?.[1] || "";

	if (isAzureNative && instanceName) {
		return new AzureChatOpenAI({
			azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
			azureOpenAIApiInstanceName: instanceName,
			azureOpenAIApiDeploymentName: deployment,
			azureOpenAIApiVersion: "2024-12-01-preview",
			temperature: 0.3,
			streaming: true,
		});
	}

	// Non-GPT models (Kimi, etc.) or missing instance name — use OpenAI-compatible endpoint
	return new ChatOpenAI({
		openAIApiKey: process.env.AZURE_OPENAI_API_KEY,
		modelName: deployment,
		configuration: {
			baseURL: `${endpoint}openai/v1`,
			defaultHeaders: {
				"api-key": process.env.AZURE_OPENAI_API_KEY || "",
			},
		},
		temperature: 0.3,
		streaming: true,
	});
}

const allTools = [...mcpTools, ...analyzerTools, ...correlatorTools];

export function createAgent() {
	const model = createModel();

	return createReactAgent({
		llm: model,
		tools: allTools,
		prompt: new SystemMessage(SYSTEM_PROMPT),
	});
}

export type Agent = ReturnType<typeof createAgent>;
