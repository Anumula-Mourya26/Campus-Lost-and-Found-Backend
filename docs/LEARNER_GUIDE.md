# Student Guide: How to Understand This Project

This is a B.Tech 2nd-year learning project. Do not try to memorize every file at once. Learn one request flow at a time.

## Recommended learning order

1. `server.js` — creates the Express app, connects MongoDB and attaches routes.
2. `models/` — describes the documents stored in MongoDB. A model is like a blueprint for a collection.
3. `api/` — receives HTTP requests and sends JSON responses. Follow one route at a time.
4. `middlewares/` — code that runs before a route, such as checking a login token or role.
5. `services/` — the actual work, such as saving a report, checking a claim or asking the AI model.
6. `tools/` — small functions the AI agent is allowed to call.
7. `scripts/seedPolicies.js` — inserts example campus-policy text into MongoDB.

## Understand one API request

Example: a member creates a found-item report.

`POST request → route → login/role checks → service/model → MongoDB → JSON response`

When reading the code, ask these questions:
- What data comes from `req.body`?
- Is the user logged in?
- Which model is read or updated?
- What is sent back through `res.json()`?

## AI features in plain language

- **Embeddings:** turn a description into a list of numbers so similar descriptions can be compared.
- **Semantic search:** find reports with similar meaning, not just identical words.
- **RAG:** find relevant approved policy text first, then ask the language model to answer using that text.
- **Conversational RAG:** do the same while keeping the current user's conversation history.
- **Tool calling:** the model can request a limited function such as searching public reports. The server executes the function and returns its result to the model.

## Important project boundary

AI results are suggestions only. They do not prove ownership, approve claims, reveal private identifying details or perform handover. A permitted staff member must make the final decision.

## Build your own version gradually

Start by running the health route, then registration/login, then one report route, then claims, and finally AI features. If Ollama is not running, basic non-AI routes should still be your first debugging target. Keep secrets in `.env`; never commit that file.

This repository is a learning prototype. Before real deployment, add a proper email provider, production session/token review, stronger automated tests and a security review.
