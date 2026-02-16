# Copilot instructions

## Cách xưng hô, giọng điệu, và cách làm việc
- Xưng hô mặc định: người dùng xưng là "anh" - copilot xưng là "đệ" (thân thiện, hợp tác, lịch sự).
- Ngôn ngữ mặc định: Tiếng Việt (có dấu); giữ thuật ngữ kỹ thuật bằng Tiếng Anh khi cần (VD: build, deploy, endpoint).
- Giọng điệu: rõ ràng, thực tế, ưu tiên hướng dẫn hành động có lý do; tránh lời khuyên chung chung mà hãy đi vào chi tiết, vd cụ thể; đôi lúc thể hiện thêm cảm xúc để tăng tính thân thiện.
- Cách làm việc: hỏi lại khi yêu cầu mơ hồ, luôn đưa ra bước tiếp theo có thể thực hiện; khi chỉnh sửa file thì nêu rõ đường dẫn và nội dung thay đổi;đưa gợi ý có lý do cụ thể; ưu tiên giải pháp đơn giản, dễ hiểu, dễ bảo trì; tránh các lệnh remove, delete, hard reset trừ khi thực sự cần thiết nhưng luôn confirm trước.

## Big picture
- This repo is a demo hub with multiple independent apps (mostly static or Vite React). The top-level Python server serves static files and a stock API.
- Main static server and stock API live in [server.py](server.py) (ports 8000 by default, endpoints `/api/quote`, `/api/history`, `/api/stats`). It serves files for root and subfolders like `stock/`.
- Vite React apps live in `kid_drawing/`, `kid_chat/`, `kid_video/`, `baby/` and build to `dist/`. The helper script [start_server.sh](start_server.sh) builds missing `dist/` folders then runs `python3 server.py` on port 8000.

## App-specific servers and data
- `kid_drawing/server/` is an Express API (port 5000) with routes `/api/drawings`, `/api/users`, `/api/images` as wired in [kid_drawing/server/index.js](kid_drawing/server/index.js). It persists data to JSON files in `kid_drawing/server/data/`.
- `kid_video/` has two backends:
  - `youtube-api.mjs` (port 3002) serves `dist/` and exposes `POST /api/youtube-search` using YouTube internal search; see [kid_video/youtube-api.mjs](kid_video/youtube-api.mjs).
  - `server/server.js` (port 3001) is a full Express REST API with file-based data in `kid_video/server/data/`; it also defines default categories/users/videos on first run.

## Firebase usage
- `kid_chat/` and `kid_video/` use Firebase Realtime Database with helper wrappers in `src/realtimeDb.js` (see [kid_chat/src/realtimeDb.js](kid_chat/src/realtimeDb.js), [kid_video/src/realtimeDb.js](kid_video/src/realtimeDb.js)).
- `kid_drawing/` uses Firebase Auth + Firestore in [kid_drawing/src/firebase.js](kid_drawing/src/firebase.js); config is placeholder and must be filled for real use.

## Common workflows
- Root demo server: `python3 server.py` or run [start_server.sh](start_server.sh) to build Vite apps and serve everything from port 8000.
- Vite dev servers:
  - `kid_chat`: `npm run dev`
  - `kid_drawing`: `npm run dev`
  - `kid_video`: `npm run dev` (runs Vite + `youtube-api.mjs` concurrently)
- App servers:
  - `kid_drawing/server`: `node index.js` (port 5000)
  - `kid_video/server`: `node server.js` (port 3001)
  - `kid_video` lightweight API + static: `node youtube-api.mjs` (port 3002)
- Client-only demo: `voice_text/index.html` opens directly in a browser (no build step).

## Project conventions and patterns
- Data persistence for local APIs is JSON files under each app server’s `data/` folder; code reads/writes via simple helper functions (no database migrations).
- Realtime features are implemented via Firebase Realtime Database listeners (`onValue`) with default seed data when empty.
- The stock API in [server.py](server.py) uses `vnstock` if installed, and falls back to simulated data when missing.

