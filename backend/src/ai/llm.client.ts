// Thin wrapper around whichever LLM provider we choose later.
// For now, this is just a stub interface.

class LlmClient {
  async invoke(prompt: string): Promise<unknown> {
    // Real implementation will call an external LLM API.
    return {
      outcome: "review",
      rationale: `Stub LLM response for prompt: ${prompt}`
    };
  }
}

export const llmClient = new LlmClient();

