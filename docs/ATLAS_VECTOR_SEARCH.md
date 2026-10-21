# Optional MongoDB Atlas Vector Search

The project works with local cosine similarity by default. For Atlas Vector Search:

1. Set `VECTOR_SEARCH_ENABLED=true` in `.env`.
2. Create a vector search index on the `reports` collection named by `REPORT_VECTOR_INDEX` (default `report_embedding_index`).
3. Create a second index on `policychunks` and named by `POLICY_VECTOR_INDEX` (default `policy_chunk_index`).
4. Configure the index path `embedding` with the vector dimensions produced by your chosen Ollama embedding model, and filter fields `status`, `category`, and `active` as used in the aggregation pipelines.

Important: report embeddings and policy embeddings must use the same embedding model and dimensions for their respective indexes. Atlas Vector Search requires a supported MongoDB Atlas deployment. Keep `VECTOR_SEARCH_ENABLED=false` for local MongoDB development.
