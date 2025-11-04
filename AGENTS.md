# Repository Guidelines

This tool provides a real-time dashboard for MCP Task Orchestrator, built with FastAPI, WebSockets, and a modular static frontend. For detailed context and roadmap, see README_V2.md and IMPLEMENTATION_PLAN.md.

## Project Structure & Module Organization

- Core servers: `server_v2.py` (v2 with WebSockets/Docker), `server.py` (v1).
- Services: `services/` — `docker_volume_detector.py`, `websocket_manager.py`, `database_pool.py`.
- Frontend: `dashboard_v2.html`, `dashboard.html`, and `static/js/` (`components/`, `utils/`).
- Scripts & docs: `start-server-v2.ps1`, `README_V2.md`, `IMPLEMENTATION_PLAN.md`, `test_phase1.py`.

## Build, Test, and Development Commands

- Setup environment:

  ```powershell
  python -m venv venv; .\venv\Scripts\activate
  pip install -r requirements.txt
  ```

- Run server (Windows script):

  ```powershell
  .\start-server-v2.ps1
  ```

- Run server (direct Python):

  ```bash
  python server_v2.py
  ```

- Access: Web UI `http://localhost:8888`, API docs `/docs`, health `/api/health`.
- Component tests:

  ```bash
  python test_phase1.py
  ```

## Coding Style & Naming Conventions

- Python: 4-space indent; use docstrings; prefer type hints for public APIs.
- Names: files/modules `snake_case.py`; classes `PascalCase`; functions/vars `snake_case`; constants `UPPER_SNAKE_CASE`.
- JavaScript: organize under `static/js/components` and `static/js/utils`; keep modules small and single-purpose.

## Testing Guidelines

- Quick services test: `python test_phase1.py` (imports, Docker detection, DB pool, WebSocket manager).
- API smoke tests:

  ```bash
  curl http://localhost:8888/api/health
  curl http://localhost:8888/api/stats
  ```

- WebSocket check (browser console):

  ```js
  const ws = new WebSocket('ws://localhost:8888/ws');
  ws.onmessage = (e) => console.log(JSON.parse(e.data));
  ```

## Commit & Pull Request Guidelines

- Commits: short, imperative summaries (e.g., "Add dependency graph API"); body explains rationale and scope; reference issues when relevant.
- PRs: include description, linked issues, test plan (commands + expected results), and screenshots/GIFs for UI changes. Ensure server boots locally and `test_phase1.py` passes.

## Security & Configuration Tips

- Env vars: `TASK_ORCHESTRATOR_DB` (default `data/tasks.db`), `ENABLE_WEBSOCKET=true|false`, `ENABLE_DOCKER_DETECTION=true|false`.
- Docker volumes: Windows uses `\\wsl.localhost`/`\\wsl$` paths when available; Linux/macOS uses direct volume paths. Fallback: copy from container (see README_V2.md).

## Architecture Overview

- Backend: FastAPI app in `server_v2.py` with modular services.
- Data: SQLite `tasks.db` from MCP Task Orchestrator; path resolved by `DockerVolumeDetector` with platform-aware strategies.
- Realtime: `WebSocketManager` watches DB mtime and broadcasts `database_update` to `/ws` clients; falls back to polling if disabled.
- Concurrency: `DatabasePool` provides per-thread SQLite connections (WAL mode) for concurrent requests.
- Frontend: `dashboard_v2.html` loads component-based JS (`static/js/components/*`) for Overview, Kanban, Dependency Graph (Cytoscape), Timeline, Analytics, and Search.

## Troubleshooting

- Database not found
  - Verify path: ensure `data/tasks.db` exists or set `TASK_ORCHESTRATOR_DB`.
  - Windows/WSL: check `\\wsl.localhost\docker-desktop-data\...\mcp-task-data\_data\tasks.db`.
  - Fallback copy: `docker cp mcp-task-orchestrator:/app/data/tasks.db ./data/tasks.db`.
- Docker detection failed
  - Ensure Docker Desktop/daemon is running.
  - Temporarily disable: set `ENABLE_DOCKER_DETECTION=false` and use a direct path.
- WebSocket issues
  - Disable realtime to test: `ENABLE_WEBSOCKET=false` then `python server_v2.py` (falls back to polling).
  - Check port `8888` and browser console for connection errors.
- Import/deps errors
  - Reinstall: `pip install -r requirements.txt` then run `python test_phase1.py`.
- Port already in use
  - Run via uvicorn with a different port: `python -m uvicorn server_v2:app --host 0.0.0.0 --port 8890`.
