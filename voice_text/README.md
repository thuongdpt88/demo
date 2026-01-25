# voice_text demo

This demo is a small client-only web app that uses the browser Web Speech API to perform realtime speech-to-text (STT).

Features:
- Realtime interim and final results
- Default language: Vietnamese (vi-VN); user can change to English or Auto
- Plain HTML + vanilla JS (no build step)

How to run locally:
1. Clone the repo (or pull latest)
2. Open `voice_text/index.html` in Chrome or Edge. (For best results use Chrome desktop or Android Chrome.)

Notes and limitations:
- Web Speech API support varies by browser. Chrome and Edge provide the best support; Firefox and Safari may not fully support continuous recognition or interim results.
- This demo is client-only and sends audio to the browser provider's STT servers (not self-hosted). If you need on-premise or higher-quality STT, consider a backend + cloud STT service (Deepgram/Google/OpenAI) or self-hosted models (whisper.cpp, Vosk).

If you want, I can next:
- Add a simple Node.js backend that streams audio to a paid STT provider for better accuracy
- Convert the demo to a React app
- Add automatic language detection and UI improvements

---
Committed by GitHub Copilot Chat Assistant per user request.
