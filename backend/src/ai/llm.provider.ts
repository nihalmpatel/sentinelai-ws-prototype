// Provider-agnostic LLM adapter types (FR-BE-06).
// Each concrete provider (OpenAI, Anthropic, stub) implements LlmProvider.

export interface LlmPrompt {
	systemPrompt: string;
	userContent: string;
}

export interface LlmProvider {
	readonly name: string;
	invoke(prompt: LlmPrompt): Promise<unknown>;
}

export interface LlmClientConfig {
	provider: "stub" | "openai" | "anthropic";
	apiKey: string;
	model: string;
	baseUrl: string;
	timeoutMs: number;
	maxRetries: number;
}

/**
 * Extract a JSON object from LLM response text that may be wrapped
 * in markdown code fences or surrounded by extra prose.
 * Returns the parsed object, or throws if no valid JSON is found.
 */
export function extractJsonFromText(text: string): unknown {
	const trimmed = text.trim();

	// 1. Try direct parse (ideal case).
	try {
		return JSON.parse(trimmed);
	} catch {
		// Fall through to extraction heuristics.
	}

	// 2. Strip markdown code fences: ```json ... ``` or ``` ... ```
	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (fenced?.[1]) {
		return JSON.parse(fenced[1].trim());
	}

	// 3. Find the outermost { … } brace pair.
	const braceStart = trimmed.indexOf("{");
	const braceEnd = trimmed.lastIndexOf("}");
	if (braceStart !== -1 && braceEnd > braceStart) {
		return JSON.parse(trimmed.slice(braceStart, braceEnd + 1));
	}

	throw new Error("No valid JSON found in LLM response text");
}
