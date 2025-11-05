# Task Orchestrator Dashboard

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.120+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Desktop-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

**Real-time monitoring dashboard for MCP Task Orchestrator** with Docker integration.

## 🎬 The Inception Moment

**The dashboard now tracks its own development!** 🤯

We've created a meta-project called "Task Orchestrator Dashboard" (Project ID: `7c39484d-6cea-4d8c-b1bd-dc2466a97303`) that uses the Task Orchestrator system to manage the dashboard's own development lifecycle.

**In the Dashboard:**
- Select the "Task Orchestrator Dashboard" project
- See 6 Features (development phases) with Phases 1-2 complete
- View 8 Tasks for upcoming enhancements
- Track the dashboard's progress... in the dashboard! 🎬

This meta-project demonstrates the system's power by using it to manage complex software development with multiple phases, features, and interdependent tasks.

_"We have to go deeper..."_ - See `.planning/META_PROJECT.md` for complete details.

---

## 🎯 What's New in v2.0

### Phase 1: Infrastructure (COMPLETE)

- ✅ **Real-Time Updates** - WebSocket-based live data synchronization (1-2 second latency)
- ✅ **Docker Integration** - Automatic Docker volume detection and access
- ✅ **Connection Pooling** - Efficient concurrent request handling
- ✅ **Enhanced API** - 10+ new endpoints exposing all database tables
- ✅ **Comprehensive Data** - Access to dependencies, sections, tags, templates, work sessions, locks

### Phase 2: Visual Enhancements (COMPLETE)

- ✅ **Multi-View Dashboard** - Overview, Kanban, Graph, and Analytics views
- ✅ **Dependency Graph** - Interactive task visualization with Cytoscape.js
- ✅ **Kanban Board** - 4-column task board with blocked task detection
- ✅ **Timeline Feed** - Chronological activity updates
- ✅ **Detail Modals** - Comprehensive task/feature information
- ✅ **Global Search** - Autocomplete search with Ctrl+K shortcut
- ✅ **Analytics Dashboard** - Charts and metrics with Chart.js

### Architecture

- Component-based frontend architecture
- Event-driven real-time updates
- Modular service layer (`src/services/` directory)
- Thread-safe database connection pooling
- WebSocket manager with database file watching
- Docker volume auto-detection with platform-specific strategies
- Graceful degradation (WebSocket fallback to polling)

## 🚀 Quick Start

### Installation

```bash
cd tools/task-orchestrator-dashboard

# Activate virtual environment
.venv\Scripts\activate   # Windows
# or
source .venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt
```

### Running v2.0

#### **Option 1: Use PowerShell startup script (Windows)**

```powershell
.\start-server.ps1
```

#### **Option 2: Direct Python**

```bash
python src/server_v2.py
```

#### **Option 3: With custom configuration**

```bash
# Set environment variables
set TASK_ORCHESTRATOR_DB=path\to\tasks.db
set ENABLE_WEBSOCKET=true
set ENABLE_DOCKER_DETECTION=true

python src/server_v2.py
```

### Accessing the Dashboard

- **Web UI**: <http://localhost:8888>
- **API Docs**: <http://localhost:8888/docs>
- **Health Check**: <http://localhost:8888/api/health>

## 🐳 Docker

Run the dashboard as an independent container alongside the MCP server while reading the same live database volume.

### Requirements

- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- The MCP server’s named volume: `mcp-task-data` (contains `tasks.db`)

### Using Docker Compose (recommended)

```bash
docker compose up --build -d
# Open http://localhost:8888
```

### Using Docker directly

```bash
docker build -t task-orchestrator-dashboard .
docker run --rm -p 8888:8888 \
-e TASK_ORCHESTRATOR_DB=/data/tasks.db \
-e ENABLE_WEBSOCKET=true \
-e ENABLE_DOCKER_DETECTION=false \
-v mcp-task-data:/data:ro \
task-orchestrator-dashboard
```

## ⚙️ Configuration

### Environment Variables

| Variable                  | Default         | Description                        |
| ------------------------- | --------------- | ---------------------------------- |
| `TASK_ORCHESTRATOR_DB`    | `data/tasks.db` | Path to task-orchestrator database |
| `ENABLE_WEBSOCKET`        | `true`          | Enable WebSocket real-time updates |
| `ENABLE_DOCKER_DETECTION` | `true`          | Auto-detect Docker volumes         |

## 📝 Contributing

See `.planning/IMPLEMENTATION_PLAN.md` for architecture details and contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

Built on top of [task-orchestrator](https://github.com/jpicklyk/task-orchestrator) by jpicklyk

Created by [ahvega](https://github.com/ahvega)