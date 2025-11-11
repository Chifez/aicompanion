## AI Real-Time Virtual Chat Application

This project delivers a web-based experience where users can join a live voice/video call with an AI assistant. The assistant listens over WebRTC, reasons in real time with OpenAI’s Realtime API, and speaks back using ElevenLabs streaming TTS. Conversations feel natural, personal, and emotionally aware.

### Repository Layout

- `frontend/` – TanStack Start (React + TypeScript) client, call UI, auth and settings pages.
- `backend/` – Go service handling WebRTC signaling, AI pipeline, persistence, and APIs.
- `docs/` – Product requirements, architecture diagrams, ADRs, onboarding.

### Getting Started

1. Clone the repository.
2. Read the product brief in `docs/` (to be added) for scope and requirements.
3. Follow the environment setup guide (coming soon) to provision API keys and development services.
4. Use the project TODOs/issue tracker to pick the next implementation milestone.

### High-Level MVP Goals

- <300 ms perceived audio round-trip between user and AI.
- Dual personalities and voice options selectable per session.
- Session transcript persistence with deletion controls and guest data expiry.

### Contributing

Please keep code formatted, linted, and covered by tests where applicable. Add or update documentation when introducing new features or architectural decisions.
