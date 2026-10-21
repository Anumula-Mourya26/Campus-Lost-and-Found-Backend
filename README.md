# Campus Lost and Found Match Desk — Backend

**Student project | Node.js + Express + MongoDB | No frontend**

This backend helps campus members report lost/found belongings, find possible matches, submit claims and ask questions about the approved recovery process. AI can suggest possible matches and answer policy questions, but it never decides ownership.

The code follows a familiar Express/Mongoose teaching pattern: `server.js`, routers, models, middleware and small service files. The project is separated into folders so each part has one clear responsibility. See `docs/LEARNER_GUIDE.md` before changing code.
 
## Features

- Register/login and password hashing.
- Lost/found reports and safe public listings.
- Private claims, evidence review and staff handover workflow.
- Role checks for members, desk officers and moderators.
- Ollama embeddings and semantic matching.
- Policy RAG, conversational RAG and a tool-calling agent.
- MongoDB storage and API examples for manual testing.

## Requirements

- Node.js 20+
- MongoDB local or MongoDB Atlas
- Ollama for AI features (non-AI API routes can be tested first)

## Setup (Windows PowerShell)

1. Open this folder in VS Code.
2. Install packages:

   ```powershell
   npm install
   ```

3. Copy the environment example:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Open `.env`. Set `DB_URL`, a long random `JWT_SECRET`, and `CAMPUS_EMAIL_DOMAIN` to your actual college email domain.
5. Start MongoDB.
6. For AI features, install/start Ollama and pull the models:

   ```powershell
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ```

7. Seed the example campus policy data:

   ```powershell
   node scripts/seedPolicies.js
   ```

8. Start the API:

   ```powershell
   npm run dev
   ```

9. Check `http://localhost:5000/api/health`.

## Folder guide

| Folder/file | Purpose |
|---|---|
| `server.js` | Starts Express and connects to MongoDB |
| `api/` | HTTP routes and request/response handling |
| `models/` | MongoDB document structures |
| `middlewares/` | Login, role, validation and error checks |
| `services/` | Main application and AI logic |
| `tools/` | Limited functions available to the AI agent |
| `scripts/` | Example data setup |
| `docs/` | Learner guide, API tests and security notes |

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Check server status |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/found-items` | Public, sanitized found-item list |
| GET | `/api/lost-found/help` | Recovery process information |
| POST | `/api/reports` | Create a lost/found report |
| GET | `/api/reports/mine` | View your reports |
| POST | `/api/items/:id/claims` | Submit a claim |
| GET | `/api/my-claims` | View your claims |
| POST | `/api/claims/:id/decision` | Staff decision |
| POST | `/api/claims/:id/handover` | Record handover |
| POST | `/api/ai/match` | Find possible semantic matches |
| POST | `/api/ai/recovery-chat` | Ask recovery questions |
| POST | `/api/ai/matching-agent` | Ask the matching agent to use allowed tools |
| POST | `/api/ai/policy-question` | Ask about approved policies using RAG |

## Test in this order

1. `GET /api/health`
2. Register and log in.
3. Create a report and inspect your own reports.
4. Try the public found-items endpoint and confirm it returns only safe fields.
5. Create a claim and test staff-only routes with the correct role.
6. Start Ollama and test semantic match, policy RAG, chat and tool calling.

See `docs/API_TESTING.md`, `docs/SECURITY_NOTES.md` and `tests/manual-checklist.md` for more details.

## Student-project note

This is a learning prototype, not a production-certified service. Email verification/reset tokens are development conveniences unless a real campus email provider is configured. Review the security notes and test permissions before any real deployment. Never commit `.env` or real personal data.
