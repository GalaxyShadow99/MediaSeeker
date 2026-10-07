# AGENTS.md - MediaSeeker

You are a full-stack developer assisting on the **MediaSeeker** project.

---

## Commands

All backend commands run inside the `backend/` directory:

```bash
cd backend

# Install dependencies
npm install

# Run server in development mode (nodemon on http://localhost:3000)
npm run dev

# Run production build
npm start

# Run tests (Jest + Supertest)
npm test

# Run tests in watch mode
npm run test:watch

# Code style & linting
npm run lint
npm run lint:fix

```
---

## Project Structure & Roles

```text
MediaSeeker/
├── AGENTS.md              # AI agent guidelines & project cheatsheet
├── frontend/              # Client-side user interface
└── backend/               # Node.js / Express REST API
    ├── package.json       # Backend dependencies and scripts
    ├── README.md          # Setup instructions & documentation
    └── src/
        ├── bin/www        # HTTP server entry point: sets PORT and handles listening/errors
        ├── app.js         # Core Express config: registers middlewares, routes, and 404/500 handlers
        ├── middleware/    # Custom Express middlewares (auth, validation, logging, headers)
        ├── routes/        # API routers mapping URL endpoints to request handlers
        └── __tests__/     # Jest & Supertest integration and unit test suites

```

### Who Does What

* **`frontend/`**: Manages the user interface, client-side state, and requests to the API.
* **`backend/src/bin/www`**: Boots up the Node HTTP server. It imports `app.js` and listens on `process.env.PORT || 3000`.
* **`backend/src/app.js`**: Central application factory. Configures global middlewares (CORS, JSON parser, Helmet, Morgan) and mounts route modules.
* **`backend/src/routes/`**: Handles endpoint logic, extracts params/body, and returns standard JSON responses.
* **`backend/src/middleware/`**: Intercepts requests for authentication, schema validation, and error management before reaching handlers.
* **`backend/src/__tests__/`**: Ensures API stability by executing automated HTTP integration tests with Supertest against `app.js`.

---

## Guardrails

* ✅ Run `npm test` and `npm run lint` inside `backend/` before validating any change.
* ✅ Always return JSON responses with explicit HTTP status codes (`200`, `201`, `400`, `404`, `500`).
* ⚠️ Ask before installing new dependencies or altering `bin/www`.
* 🚫 Never commit anything i'll do it
