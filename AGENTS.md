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

---

## Agent Role & Autonomy

- **Allowed Modifications**: Application code (`backend/app/`, `frontend/src/`), tests, documentation, and configuration files.
- **Lockfile Rule**: 🚫 **STRICTLY PROHIBITED** from modifying lockfiles (`*-lock.*`, `uv.lock`, `package-lock.json`) unless explicitly instructed by the user.
- **Production Standard**: Always write complete, production-ready code. No placeholders, no mocked shortcuts in core code paths, and no unresolved `TODO` comments.
- **Git Commits**: 🚫 **Never commit directly** — the user manages git commits.

---

## Naming Conventions (Casing)

| Target | Backend (Python) | Frontend (React / JS) | Example |
| :--- | :--- | :--- | :--- |
| **Variables & Functions** | `snake_case` | `camelCase` | `fetch_tmdb_details`, `handleSubmit` |
| **Classes, Types & Interfaces** | `PascalCase` | `PascalCase` | `MediaResponse`, `LoginForm` |
| **Global Constants & Enums** | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` | `TMDB_BASE_URL`, `JWT_SECRET` |
| **Files & Folders** | `snake_case.py` | `camelCase.jsx` / `PascalCase.jsx` | `database.py`, `Layout.jsx`, `about.jsx` |
| **Components** | N/A | `PascalCase` | `function MyFooter()`, `function Layout()` |

---

## Architecture & Code Guidelines

### Imports & Exports
- **Clean Imports**: Avoid deep relative imports (`../../..`). Use root package imports in backend (`from app.config import settings`, `from app.schemas.apiResponse import ApiResponse`).
- **Exports**:
  - Frontend: Use `export default` for page and layout components (`Layout.jsx`, `home.jsx`), and named exports for reusable utility functions.
  - Backend: Explicit imports at the top of each file following standard library -> third-party -> local application modules order.

### Type Rigor
- **No `any`**: Strictly avoid unconstrained `any` types.
- **Explicit Return Types**: All backend utility functions and endpoint helpers must include explicit return type hints (e.g. `-> dict`, `-> list[dict]`, `-> ApiResponse`).
- **Response Format**: All API endpoints must return typed Pydantic response models using `ApiResponse(success=True, message="...", data=...)`.

### Error Handling Pattern
- **Structured Exceptions**: Catch specific exceptions (`httpx.HTTPStatusError`, `sqlite3.Error`), log when relevant, and raise typed `HTTPException` with meaningful status codes and error details.
- **No Silent Failures**: Never swallow exceptions with bare `except: pass`.

---

## Quality & Validation Protocol

### Frontend Commands (`frontend/`)
All frontend commands run inside `frontend/` using **`npm`**:

```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Lint & build check
npm run lint
npm run build
```

### Mandatory Verification Before Task Completion
1. Backend: `uv run ruff check` & `uv run pytest -v` must pass with **0 errors**.
2. Frontend: `npm run build` must build cleanly without unresolved imports or compile errors.

---

## Git & Deliverables

- **Commit Convention**: Format commit messages following the Conventional Commits specification:
  - `feat(...)`: A new feature
  - `fix(...)`: A bug fix
  - `refactor(...)`: Code change that neither fixes a bug nor adds a feature
  - `docs(...)`: Documentation only changes
  - `test(...)`: Adding missing tests or correcting existing tests
  - `chore(...)`: Tooling, dependency, or configuration updates
- **Language Rule**: Code, docstrings, variable names, inline comments, and commit messages must be **100% in English**.
