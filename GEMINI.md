# Project Overview

This project is a real-time, web-based dashboard for the MCP Task Orchestrator. It provides a comprehensive visual interface for monitoring and managing projects, features, tasks, and their dependencies. The dashboard is built with a Python (FastAPI) backend and a vanilla JavaScript frontend. It uses WebSockets for real-time data synchronization and can be run as a standalone application or as a Docker container.

The backend is a FastAPI application that provides a rich API for interacting with the task orchestrator database. The frontend is a single-page application that uses a component-based architecture to display the data in various views, including an overview, a Kanban board, a dependency graph, and an analytics dashboard.

## Building and Running

### Prerequisites

* Python 3.8+
* Docker Desktop (optional, for containerized deployment)

### Installation

1. **Activate virtual environment:**
    * Windows: `venv\Scripts\activate`
    * Linux/macOS: `source venv/bin/activate`
2. **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

* **With PowerShell startup script (Windows):**

    ```powershell
    .\start-server-v2.ps1
    ```

* **Directly with Python:**

    ```bash
    python server_v2.py
    ```

* **With Docker Compose:**

    ```bash
    docker compose up --build -d
    ```

### Accessing the Dashboard

* **Web UI:** [http://localhost:8888](http://localhost:8888)
* **API Docs:** [http://localhost:8888/docs](http://localhost:8888/docs)

## Development Conventions

* **Backend:** The backend is a FastAPI application. It follows a standard structure with a main `server_v2.py` file, a `services` directory for business logic, and Pydantic models for data validation.
* **Frontend:** The frontend is built with vanilla JavaScript (ES6+). It uses a component-based architecture, with each component having its own JavaScript file in the `static/js/components` directory. The `main.js` file is the application's entry point.
* **Styling:** The project uses custom CSS for styling. The main stylesheet is embedded in the `dashboard.html` file.
* **Testing:** The project has a `test_phase1.py` file for backend component tests. The `README.md` file also provides instructions for manual API and WebSocket testing.
