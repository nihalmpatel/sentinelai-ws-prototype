import {LlmPrompt, LlmProvider, LlmClientConfig, extractJsonFromText} from "../llm.provider";

/**
 * OpenAI Chat Completions provider.
 * Uses JSON mode (`response_format`) for structured output.
 * Retries on timeouts and 5xx errors with exponential back-off.
 */
export class OpenAiProvider implements LlmProvider {
	readonly name = "openai";

	constructor(private readonly config: LlmClientConfig) {
		if (!config.apiKey) {
			throw new Error("OpenAI provider requires LLM_API_KEY environment variable");
		}
	}

	async invoke(prompt: LlmPrompt): Promise<unknown> {
		const url = `${this.config.baseUrl}/chat/completions`;

		const body = {
			model: this.config.model,
			response_format: {type: "json_object"},
			temperature: 0.2,
			messages: [
				{role: "system" as const, content: prompt.systemPrompt},
				{role: "user" as const, content: prompt.userContent},
			],
		};

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
			// Exponential back-off on retries (1 s, 2 s, 4 s … capped at 8 s).
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
						Authorization: `Bearer ${this.config.apiKey}`,
					},
					body: JSON.stringify(body),
					signal: controller.signal,
				});

				clearTimeout(timer);

				if (!response.ok) {
					const errorText = await response.text().catch(() => "");
					const err = new Error(`OpenAI API error ${response.status}: ${errorText}`);

					// 4xx = client error (bad key, invalid request) → don't retry.
					if (response.status >= 400 && response.status < 500) {
						throw err;
					}
					// 5xx = server error → retry.
					lastError = err;
					continue;
				}

				const json = (await response.json()) as {
					choices?: {message?: {content?: string}}[];
				};

				const content = json.choices?.[0]?.message?.content;
				if (typeof content !== "string") {
					throw new Error("OpenAI response missing choices[0].message.content");
				}

				return extractJsonFromText(content);
			} catch (err) {
				clearTimeout(timer);
				const error = err instanceof Error ? err : new Error(String(err));

				// Timeout → retry.
				if (error.name === "AbortError") {
					lastError = new Error(`OpenAI request timed out after ${this.config.timeoutMs}ms`);
					continue;
				}

				// Non-retryable errors: client errors, missing content, bad JSON.
				if (
					error.message.startsWith("OpenAI API error 4") ||
					error.message.includes("missing choices") ||
					error.message.includes("No valid JSON")
				) {
					throw error;
				}

				// Network / unknown errors → retry.
				lastError = error;
			}
		}

		throw lastError ?? new Error("OpenAI request failed after retries");
	}
}
