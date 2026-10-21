const baseUrl = () => (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
export async function generateEmbedding(text) {
  const response = await fetch(`${baseUrl()}/api/embed`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text", input: text }),
    signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 60000))
  });
  if (!response.ok) throw new Error(`Embedding service returned ${response.status}. Is Ollama running and the embedding model pulled?`);
  const data = await response.json();
  if (!data.embeddings?.[0]) throw new Error("Ollama returned no embedding");
  return data.embeddings[0];
}
