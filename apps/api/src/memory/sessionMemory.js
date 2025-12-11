export const sessionMemoryStore = new Map();

/**
 * Retrieves the session memory or initializes it if not exists.
 * @param {string} sessionId
 * @returns {{ messages: Array<{role: string, content: string}>, preferences: { explainLevel?: string, tone?: string, language?: string } }}
 */
export function getSessionMemory(sessionId) {
  if (!sessionMemoryStore.has(sessionId)) {
    sessionMemoryStore.set(sessionId, {
      messages: [],
      preferences: {},
    });
  }
  return sessionMemoryStore.get(sessionId);
}

/**
 * Updates the session memory with new messages and potential hints.
 * @param {string} sessionId
 * @param {string} userMessage
 * @param {string} assistantMessage
 * @param {object} [hints] - Detected preferences from the conversation
 */
export function updateSessionMemory(
  sessionId,
  userMessage,
  assistantMessage,
  hints = {}
) {
  const memory = getSessionMemory(sessionId);

  // Update messages (Keep only last 10 pairs to save RAM/Tokens)
  memory.messages.push({ role: "user", content: userMessage });
  if (assistantMessage) {
    memory.messages.push({ role: "assistant", content: assistantMessage });
  }

  if (memory.messages.length > 20) {
    memory.messages = memory.messages.slice(-20);
  }

  // Update preferences if hints are provided
  if (hints) {
    memory.preferences = { ...memory.preferences, ...hints };
  }
}

/**
 * Summarizes the recent messages into a context string.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {string}
 */
export function summarizeMessages(messages) {
  if (!messages || messages.length === 0) return "";

  // Take the last 6 messages for immediate context
  // We don't need a complex summarization LLM call here as requested ("solo recortes y concatenación")
  const recent = messages.slice(-6);

  return recent
    .map(
      (m) =>
        `${m.role === "user" ? "Usuario" : "WADI"}: ${m.content.substring(0, 300)}${m.content.length > 300 ? "..." : ""}`
    )
    .join("\n");
}
