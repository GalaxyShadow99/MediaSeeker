# AGENTS.md - MediaSeeker

You are a full-stack developer assisting on the **MediaSeeker** project.

---

## Commands

All backend commands run inside the `backend/` directory using **`uv`**:

```bash
cd backend

# Install dependencies (syncs virtual environment)
uv sync

# Run development server (FastAPI with auto-reload on http://localhost:8000)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run automated tests (Pytest)
uv run pytest -v

# Run code style & linting (Ruff)
uv run ruff check
uv run ruff format --check
uv run ruff format  # Apply auto-formatting
```

---

## Project Structure & Roles

```text
MediaSeeker/
├── AGENTS.md              # AI agent guidelines & project cheatsheet
├── frontend/              # Client-side user interface (React)
└── backend/               # Python / FastAPI REST API
    ├── pyproject.toml     # uv project configuration and dependencies
    ├── uv.lock            # Exact locked dependencies
    ├── app/
    │   ├── main.py        # FastAPI app, lifespan, CORS, and routers mounting
    │   ├── config.py      # Pydantic Settings (.env configuration)
    │   ├── database.py    # Raw SQLite connection, WAL mode & table schemas
    │   ├── dependencies.py# JWT security & admin authentication dependencies
    │   ├── schemas/       # Pydantic validation schemas (Auth, User, Media)
    │   ├── routers/       # API endpoints (system, auth, admin, media)
    │   ├── services/      # External integrations (TMDB client httpx)
    │   └── utils/         # Password hashing (bcrypt) & JWT helpers
    └── tests/             # Pytest test suites (TestClient)
```

### Who Does What

* **`frontend/`**: Manages user interface, state, and API requests.
* **`backend/app/main.py`**: Boots up the FastAPI application with auto-generated Swagger UI (`/docs`) and ReDoc (`/redoc`).
* **`backend/app/database.py`**: Manages SQLite connections and executes direct SQL queries with WAL mode and foreign keys.
* **`backend/app/schemas/`**: Pydantic models for incoming request validation and Swagger documentation schemas.
* **`backend/app/routers/`**: HTTP endpoints (auth, admin, media CRUD) returning typed responses.
* **`backend/tests/`**: Automated integration test suite running with Pytest and TestClient.

---

## Guardrails

* ✅ Run `uv run pytest` and `uv run ruff check` inside `backend/` before validating any change.
* ✅ Use **pure SQL** with parameterized queries (no heavy ORMs).
* ⚠️ Ask before adding new third-party packages.
* 🚫 Never commit anything i'll do it.
