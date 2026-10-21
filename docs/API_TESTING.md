# API testing quick guide

Use Postman, Insomnia, or curl. The API uses an HTTP-only `accessToken` cookie and CSRF protection for protected write requests.

1. `GET http://localhost:5000/api/health`
2. `GET http://localhost:5000/api/auth/csrf` and save the `csrfToken` value and cookie.
3. `POST /api/auth/register` JSON: `{ "name":"Demo Member", "email":"student@yourcollege.edu.in", "password":"ExamplePass123" }`. Set `CAMPUS_EMAIL_DOMAIN` to your real domain or leave the example value to disable domain enforcement for local demo.
4. Copy `verificationToken` from the response in development and `POST /api/auth/verify-email` with `{ "token":"..." }`. Save the access cookie.
5. Before protected POST/PATCH requests, send header `x-csrf-token: <csrfToken>` from step 2. Cookies must be retained by your API client.
6. `POST /api/reports` with report fields: `reportType`, `title`, `description`, `category`, `broadLocation`, `eventDate` (ISO date), and optional `privateIdentifiers`, `storageLocation`, `desk`.
7. `POST /api/ai/match` with `{ "description":"dark zip pouch with a laptop sleeve", "category":"BAGS", "broadLocation":"library" }`.
8. `POST /api/ai/recovery-chat` with `{ "message":"How do I claim a found item?" }`.
9. `POST /api/ai/matching-agent` with `{ "message":"Help me find my missing headphones near the library" }`.
10. Public endpoints: `GET /api/found-items` and `GET /api/lost-found/help`.

For the first AI request, ensure Ollama is running and the configured models are downloaded. Seed the policy knowledge base with `npm run seed:policies` after installing dependencies.
