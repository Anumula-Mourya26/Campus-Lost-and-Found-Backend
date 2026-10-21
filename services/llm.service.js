const baseUrl = () => (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
export async function chatWithModel(messages, options = {}) {
  const response = await fetch(`${baseUrl()}/api/chat`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OLLAMA_CHAT_MODEL || "llama3.1:8b", messages, stream: false, ...options }),
    signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 60000))
  });
  if (!response.ok) throw new Error(`LLM service returned ${response.status}. Check Ollama and the configured model.`);
  const data = await response.json();
  return data.message || { role: "assistant", content: "I could not generate an answer." };
}
