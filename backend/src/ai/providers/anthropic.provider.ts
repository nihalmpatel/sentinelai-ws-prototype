import {LlmPrompt, LlmProvider, LlmClientConfig, extractJsonFromText} from "../llm.provider";

/**
 * Anthropic Messages API provider.
 * Retries on timeouts and 5xx errors with exponential back-off.
 */
export class AnthropicProvider implements LlmProvider {
	readonly name = "anthropic";

	constructor(private readonly config: LlmClientConfig) {
		if (!config.apiKey) {
			throw new Error("Anthropic provider requires LLM_API_KEY environment variable");
		}
	}

	async invoke(prompt: LlmPrompt): Promise<unknown> {
		const url = `${this.config.baseUrl}/messages`;

		const body = {
			model: this.config.model,
			max_tokens: 1024,
			system: prompt.systemPrompt,
			messages: [{role: "user" as const, content: prompt.userContent}],
		};

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
			if (attempt > 0) {
				const delayMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}

			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

			try {
				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": this.config.apiKey,
						"anthropic-version": "2023-06-01",
					},
					body: JSON.stringify(body),
					signal: controller.signal,
				});

				clearTimeout(timer);

				if (!response.ok) {
					const errorText = await response.text().catch(() => "");
					const err = new Error(`Anthropic API error ${response.status}: ${errorText}`);

					if (response.status >= 400 && response.status < 500) {
						throw err;
					}
					lastError = err;
					continue;
				}

				const json = (await response.json()) as {
					content?: {type: string; text?: string}[];
				};

				const textBlock = json.content?.find((b) => b.type === "text");
				if (!textBlock?.text) {
					throw new Error("Anthropic response missing text content block");
				}

				return extractJsonFromText(textBlock.text);
			} catch (err) {
				clearTimeout(timer);
				const error = err instanceof Error ? err : new Error(String(err));

				if (error.name === "AbortError") {
					lastError = new Error(`Anthropic request timed out after ${this.config.timeoutMs}ms`);
					continue;
				}

				if (
					error.message.startsWith("Anthropic API error 4") ||
					error.message.includes("missing text content") ||
					error.message.includes("No valid JSON")
				) {
					throw error;
				}

				lastError = error;
			}
		}

		throw lastError ?? new Error("Anthropic request failed after retries");
	}
}
