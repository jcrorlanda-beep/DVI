# DVI Workshop Management App

DVI is a React + TypeScript workshop management system for repair orders, inspections, release, parts, backjobs, service history, technician productivity, supplier analytics, customer portals, and advisor dashboards.

## Local setup

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Create a production build with `npm run build`.
4. Run end-to-end tests with `npm run test:e2e`.

## Hybrid AI assist

The app uses a local-first hybrid AI setup for advisor communication tools:

1. Ollama local AI first
2. OpenAI cloud fallback
3. Template fallback if both fail

Supported environment variables:

- `VITE_OLLAMA_API_URL`
- `VITE_OLLAMA_MODEL`
- `VITE_OPENAI_API_KEY`

Notes:

- AI content is advisory only and remains reviewable before use.
- API keys are not stored in localStorage.
- The app continues to work without AI.
- Use the Settings page to review AI mode, module toggles, and logs.

For same-WiFi Ollama use, point `VITE_OLLAMA_API_URL` at the machine running Ollama, such as `http://192.168.1.20:11434`.

## Deployment readiness

- Keep `.env` and `.env.*` out of git.
- Do not hardcode API keys in frontend code.
- Template fallback should remain available when AI providers are offline.

## Roadmap notes

- Later: Global UX Declutter Refactor. This is intentionally not implemented in the current operational feature batch.
- Future UX rule: list pages show summaries only, create actions open modal/page, selecting an item opens detail view, and dashboards stay summary-focused.
