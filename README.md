# katha

[![CI Workflow](https://img.shields.io/badge/CI-GitHub%20Actions-181717?logo=github)](./.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**कथा**

Turn exported chat logs into cinematic memoirs with customizable tone, chaptered output, translation, and text-to-speech.

## Features

- Nostalgic two-scene flow: setup -> generation -> chapter carousel
- Narrative formats: `memoir`, `letter`, `timeline`
- Output length presets up to 2000 words
- Tone presets for emotional style control
- Sarvam-powered translation and TTS
- PDF export and audio download

## Screenshots

Setup scene:

![Katha Setup](docs/assets/setup-screen.png)

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- GSAP + Anime.js
- jsPDF

## Architecture

```text
katha/
  backend/    # FastAPI story + translation + TTS service
  frontend/   # Next.js app (this repo)
```

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.10+
- API key for at least one LLM provider (`DeepSeek`, `OpenAI`, `Anthropic`, or `Gemini`)
- Optional: `SARVAM_API_KEY` for translation + speech

## Quick Start

### 1. Clone and install frontend

```bash
git clone https://github.com/Ayush-e4/katha.git
cd katha
npm install
```

### 2. Configure backend environment

Create `../backend/.env` using [docs/backend.env.example](docs/backend.env.example):

```env
DEEPSEEK_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
SARVAM_API_KEY=

DEFAULT_LLM_PROVIDER=deepseek
DEFAULT_LLM_MODEL=

SARVAM_TRANSLATE_URL=https://api.sarvam.ai/translate
SARVAM_TTS_URL=https://api.sarvam.ai/text-to-speech
SARVAM_DEFAULT_SPEAKER=priya
```

### 3. Start backend (from sibling `backend` folder)

```bash
cd ../backend
python -m pip install fastapi uvicorn python-multipart requests python-dotenv
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Start frontend (this repo)

```bash
cd ../frontend
npm run dev
```

App URL: `http://localhost:3000`

## Backend Contract

Frontend expects backend at `http://127.0.0.1:8000` with:

- `POST /api/generate-story`
- `GET /api/capabilities`
- `POST /api/sarvam/translate`
- `POST /api/sarvam/tts`

## How to Use

1. Upload a WhatsApp `.txt` export.
2. Select format, tone, output length, and language.
3. Click `Begin Reconstruction`.
4. After generation, read chapters in the carousel.
5. Optionally:
   - Download PDF
   - Speak text aloud
   - Download generated audio

## Quality Checks

```bash
npm run lint
npm run build
```

## Troubleshooting

- Translation/TTS returns `502`:
  - confirm `SARVAM_API_KEY` is set in backend `.env`
  - confirm backend is running on `127.0.0.1:8000`
- Translation says invalid language:
  - keep source as English base and choose target from app dropdown
- "Speak" fails for some voices:
  - use backend default speaker from `SARVAM_DEFAULT_SPEAKER` (currently `priya`)
- Frontend loads but generation fails:
  - check backend logs for provider key errors

## Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run start` - serve production build

## Open Source

- [MIT License](LICENSE)
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
