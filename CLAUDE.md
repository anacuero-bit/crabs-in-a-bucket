# CrabFight code repo

This is the CrabFight app repo (`crabs-in-a-bucket`). Public-facing product description: [README.md](README.md). Live at [crabfight.ai](https://crabfight.ai).

## Layout

- `arena/` — Next.js frontend. See [arena/AGENTS.md](arena/AGENTS.md) for in-tree Next.js notes (breaking-changes warning, etc.).
- `api/` — Fastify + SQLite backend. Routes in `api/src/routes/`, utils in `api/src/utils/`, scripts in `api/scripts/`.
- `cli/` — Node CLI (work-in-progress; web upload at `/compete` is the canonical submission path for now).
- `seed/` — sample battle submissions used for development.
- `scripts/smoke-test.sh` — end-to-end integrity invariant for cutover verification.

## House Crab

Auto-generated opponent via Claude Sonnet 4. Requires `ANTHROPIC_API_KEY` in `api/.env`. On failure, submissions are saved with `match_status: pending`; users get a retry button on the result screen, and operators can drain the backlog with `node api/scripts/retry-pending-matches.js`.

## Brand state

Public-facing facts live in this repo (README, source). Internal brand state — strategic context, audit history, sticky/decision tracking, migration playbook adherence — lives outside this repo and is not duplicated here.
