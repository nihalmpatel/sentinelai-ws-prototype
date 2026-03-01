// Thin wrapper around whichever LLM provider we choose later.
// For now, this is just a stub interface.

class LlmClient {
  async invoke(promptJson: string): Promise<unknown> {
    // Real implementation will call an external LLM API.
    // Input must be JSON-only for this prototype contract.
    void promptJson;
    return {
      riskLevel: "MEDIUM",
      recommendedAction: "MONITOR",
      justification:
        "Stub LLM decision draft. Recommend monitoring and human review based on provided signals.",
      confidence: 0.55,
      fairnessFlags: []
    };
  }
}

export const llmClient = new LlmClient();

