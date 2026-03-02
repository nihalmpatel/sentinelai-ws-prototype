// Provider-agnostic LLM client (FR-BE-06).
// Reads LLM_PROVIDER from env to select the active provider.
// Falls back to the deterministic stub when no provider is configured.

import {LlmPrompt, LlmProvider, LlmClientConfig} from "./llm.provider";
import {StubProvider} from "./providers/stub.provider";
import {OpenAiProvider} from "./providers/openai.provider";
import {AnthropicProvider} from "./providers/anthropic.provider";

function resolveConfig(): LlmClientConfig {
	const raw = (process.env.LLM_PROVIDER ?? "stub").toLowerCase().trim();
	const provider = (raw === "openai" || raw === "anthropic" ? raw : "stub") as LlmClientConfig["provider"];

	const defaults: Record<string, {model: string; baseUrl: string}> = {
		openai: {model: "gpt-4o", baseUrl: "https://api.openai.com/v1"},
		anthropic: {model: "claude-sonnet-4-20250514", baseUrl: "https://api.anthropic.com/v1"},
		stub: {model: "stub", baseUrl: ""},
	};

	const d = defaults[provider];

	return {
		provider,
		apiKey: process.env.LLM_API_KEY ?? "",
		model: process.env.LLM_MODEL ?? d.model,
		baseUrl: process.env.LLM_BASE_URL ?? d.baseUrl,
		timeoutMs: Number(process.env.LLM_TIMEOUT_MS) || 30_000,
		maxRetries: Number(process.env.LLM_MAX_RETRIES) || 2,
	};
}

function createProvider(config: LlmClientConfig): LlmProvider {
	switch (config.provider) {
		case "openai":
			return new OpenAiProvider(config);
		case "anthropic":
			return new AnthropicProvider(config);
		default:
			return new StubProvider();
	}
}

class LlmClient {
	private readonly config: LlmClientConfig;
	private readonly provider: LlmProvider;

	constructor() {
		this.config = resolveConfig();
		this.provider = createProvider(this.config);
		// eslint-disable-next-line no-console
		console.log(`[LLM] Provider: ${this.provider.name}, Model: ${this.config.model}`);
	}

	/** Active provider name (e.g. "openai", "anthropic", "stub"). */
	get providerName(): string {
		return this.provider.name;
	}

	/** Active model identifier (e.g. "gpt-4o", "claude-sonnet-4-20250514"). */
	get modelName(): string {
		return this.config.model;
	}

	async invoke(prompt: LlmPrompt): Promise<unknown> {
		return this.provider.invoke(prompt);
	}
}

export const llmClient = new LlmClient();
