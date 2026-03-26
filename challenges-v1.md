# Crabs in a Bucket — Challenge Design v1

**Design Principles:**
- 10 minutes max per challenge
- Every challenge requires 3+ distinct capabilities (tools, skills, outputs)
- Every step depends on the previous — chain of competence, not parallel busywork
- Multiple deliverables: not one file, a coordinated set
- Automated verification at every layer
- A bare LLM fails at step 1. A mediocre harness gets halfway. A killer system finishes clean.

---

## Difficulty Tiers

| Tier | Name | Time | Tools Required | Deliverables |
|------|------|------|---------------|-------------|
| 1 | Warm-Up | 5 min | 2-3 | 2-3 files |
| 2 | Sprint | 7 min | 3-5 | 4-6 files |
| 3 | Gauntlet | 10 min | 5-7 | 6-10 files |
| 4 | Boss Fight | 10 min | 7+ | 8-12 files, everything chains |

---

## TIER 1 — WARM-UP (5 min)

### W-01: "Broken API"
**Scenario:** A client's Express API has 3 endpoints. Two are broken. Tests are provided but failing.

**What the agent must do:**
1. Read the codebase (4 files)
2. Run the test suite — observe failures
3. Debug and fix both broken endpoints
4. Re-run tests — all must pass
5. Generate a short incident report (what was wrong, what was fixed)

**Deliverables:**
- Fixed source files
- Passing test suite (verified by runner)
- `incident-report.md` — what broke, why, how it was fixed

**Judging:**
- Tests pass: 60 points
- No regressions: 15 points
- Incident report accuracy (AI referee): 15 points
- Time bonus (under 3 min): 10 points

**Capability gates:** File I/O, code execution, test running, iterative debugging, markdown generation

---

### W-02: "Data Clean"
**Scenario:** A CSV file with 500 rows of customer data. 12% have formatting issues (mixed date formats, inconsistent phone numbers, duplicate emails, missing required fields).

**What the agent must do:**
1. Read and analyze the CSV
2. Write a cleaning script that: normalizes dates to ISO 8601, formats phone numbers to E.164, deduplicates by email (keep most recent), flags rows missing required fields
3. Execute the script
4. Output: `cleaned.csv` + `rejected.csv` (invalid rows) + `cleaning-report.json` (stats: rows processed, cleaned, rejected, by category)

**Deliverables:**
- `cleaning-script.py` (or .js/.ts)
- `cleaned.csv` — valid rows, normalized
- `rejected.csv` — invalid rows with rejection reason column
- `cleaning-report.json` — stats matching actual output

**Judging:**
- cleaned.csv matches expected output: 40 points (row-by-row comparison)
- rejected.csv correct: 20 points
- cleaning-report.json stats match reality: 15 points
- Script runs without errors: 15 points
- Time bonus: 10 points

**Capability gates:** File I/O, code execution, data processing, multi-format output

---

### W-03: "Spec to Schema"
**Scenario:** A product manager's natural language requirements doc for an e-commerce feature (wishlists with sharing, notifications, price tracking).

**What the agent must do:**
1. Read the requirements doc
2. Design a database schema (SQL) with proper relationships, indexes, constraints
3. Write seed data (20+ realistic rows across all tables)
4. Write 5 specific queries the PM asked for (e.g., "top 10 most-wishlisted products this week")
5. Execute everything — schema creates, seed inserts, all queries return results
6. Output query results as JSON

**Deliverables:**
- `schema.sql` — tables, relationships, indexes, constraints
- `seed.sql` — realistic test data
- `queries.sql` — 5 business queries
- `results.json` — actual query outputs

**Judging:**
- Schema creates without errors: 20 points
- Seed data inserts cleanly: 15 points
- All 5 queries execute: 25 points (5 each)
- Query results are correct for the seed data: 20 points
- Schema design quality (AI referee — normalization, indexes, naming): 10 points
- Time bonus: 10 points

**Capability gates:** File creation, SQL execution, multi-file coordination, iterative debugging

---

## TIER 2 — SPRINT (7 min)

### S-01: "Competitive Intel"
**Scenario:** The CEO needs a competitive analysis of [specific real market — e.g., "open-source vector databases"] by end of day.

**What the agent must do:**
1. Web search for current players in the market (minimum 6 competitors)
2. For each: fetch their website, extract pricing, key features, latest release/update
3. Create structured data: `competitors.json` with standardized fields
4. Generate a comparison matrix: `comparison.csv` (rows = competitors, cols = features/pricing/etc.)
5. Write an executive brief: `analysis.md` — market overview, leader, gaps, recommendation
6. All facts must have source URLs. All URLs must be real.

**Deliverables:**
- `competitors.json` — structured data, minimum 6 entries
- `comparison.csv` — feature/pricing matrix
- `analysis.md` — executive brief with cited sources
- `sources.json` — all URLs used with access timestamps

**Judging:**
- Minimum 6 competitors found: 15 points
- competitors.json schema valid + complete: 15 points
- comparison.csv has all required columns: 15 points
- URLs in sources.json resolve (HTTP 200): 15 points
- Data freshness (info from last 90 days): 10 points
- Analysis quality (AI referee — insight depth, actionability): 20 points
- Time bonus: 10 points

**Capability gates:** Web search, web fetch (multiple sites), file creation (4 files), data structuring, synthesis, citation tracking

---

### S-02: "Microservice in a Box"
**Scenario:** Build a complete REST microservice from a spec.

**The spec (given to agent):**
A URL shortener service with: POST /shorten (takes a URL, returns a short code), GET /:code (redirects to original URL), GET /stats/:code (returns click count, creation date, last accessed), DELETE /:code (requires API key auth). Must persist to SQLite. Must include rate limiting (100 req/min per IP).

**What the agent must do:**
1. Scaffold the project (package.json/requirements.txt, source files, test files)
2. Implement all 4 endpoints
3. Implement SQLite persistence
4. Implement rate limiting
5. Write tests covering all endpoints + edge cases (invalid URLs, missing codes, auth failures, rate limit hit)
6. Run tests — all must pass
7. Generate API docs (OpenAPI/Swagger YAML or markdown)

**Deliverables:**
- Project scaffold (5-8 files)
- Working server code
- SQLite database setup
- Test file(s) with 10+ test cases
- `api-docs.yaml` or `api-docs.md`
- All tests passing

**Judging:**
- Server starts without errors: 10 points
- Each endpoint works correctly: 10 points × 4 = 40 points
- Rate limiting works: 10 points
- Tests pass: 15 points
- API docs accurate: 10 points
- Code quality (AI referee — structure, error handling, security): 10 points
- Time bonus: 5 points

**Capability gates:** Multi-file scaffolding, code execution, dependency installation, test writing + running, iterative debugging, documentation generation

---

### S-03: "Data Story"
**Scenario:** Given a real-world dataset (e.g., 2024 global temperature anomalies, or a city's 311 service requests), produce a complete data analysis.

**What the agent must do:**
1. Read and explore the dataset (understand columns, distributions, anomalies)
2. Write a data processing script that: cleans the data, computes 5 specific metrics asked in the brief, identifies top 3 insights/trends
3. Generate visualizations: 3 charts as SVG or HTML (bar chart, time series, distribution)
4. Write a narrative report connecting the data to the insights
5. Export a summary table as CSV
6. All numbers in the report must match the actual computed values

**Deliverables:**
- `analysis.py` (or .js) — processing script
- `metrics.json` — computed metrics (must match expected values)
- `chart-1.svg`, `chart-2.svg`, `chart-3.svg` (or single `charts.html`)
- `report.md` — narrative with inline metric references
- `summary.csv` — key figures table

**Judging:**
- Script runs without errors: 10 points
- metrics.json values correct (within 1% tolerance): 25 points (5 each)
- Charts generated and render valid SVG/HTML: 15 points
- Report references correct metrics (AI referee cross-checks numbers): 15 points
- Insights quality (AI referee — non-obvious, data-supported): 15 points
- summary.csv matches metrics.json: 10 points
- Time bonus: 10 points

**Capability gates:** File I/O, code execution, data processing, visualization generation, multi-format output coordination, numerical accuracy

---

### S-04: "Debug Relay"
**Scenario:** A full-stack app (React frontend + Node backend + PostgreSQL). Three bugs span the entire stack: one frontend rendering bug, one API logic error, one database query performance issue.

**What the agent must do:**
1. Read the codebase (15+ files across 3 layers)
2. Run the app and observe the symptoms
3. Trace each bug to its root cause across the stack
4. Fix all three bugs
5. Run the test suite (frontend, backend, integration)
6. Write a post-mortem for each bug: root cause, fix, how to prevent recurrence

**Deliverables:**
- Fixed source files (across frontend, backend, database layers)
- All tests passing (3 test suites)
- `post-mortem.md` — 3 bugs documented with root cause analysis

**Judging:**
- Frontend tests pass: 15 points
- Backend tests pass: 15 points
- Integration tests pass: 15 points
- No regressions: 10 points
- Post-mortem accuracy (AI referee validates root cause analysis): 20 points
- Cross-stack tracing demonstrated (fixes are in correct layers): 15 points
- Time bonus: 10 points

**Capability gates:** Multi-directory file reading, code execution across runtimes, cross-stack debugging, test running (multiple suites), technical writing

---

## TIER 3 — GAUNTLET (10 min)

### G-01: "Live Brief"
**Scenario:** A startup founder says: "I want to build [specific SaaS idea — rotated each challenge instance]. Research the market, tell me if it's worth it, then build me a proof of concept."

**What the agent must do (3 phases, chained):**

**Phase 1 — Research (3 min target):**
1. Web search for existing competitors, market size, recent funding
2. Identify 5+ competitors with URLs, pricing, differentiators
3. Output: `market-research.md` with cited sources + `competitors.json`

**Phase 2 — Decision (1 min target):**
4. Analyze findings: go/no-go recommendation with reasoning
5. If go: define MVP scope (3-5 core features from competitive gaps)
6. Output: `recommendation.md` with feature list and justification

**Phase 3 — Build (6 min target):**
7. Scaffold a working prototype (API with 3-5 endpoints implementing core features)
8. Write tests for each endpoint
9. Create a README with setup instructions that actually work
10. Run tests — all pass
11. Output: full project directory + `README.md`

**Deliverables (8-10 files):**
- `market-research.md` — cited competitive analysis
- `competitors.json` — structured competitor data
- `recommendation.md` — go/no-go with feature spec
- Project source code (3-5 files)
- Test file(s)
- `README.md` — setup instructions

**Judging:**
- Phase 1 — competitors.json has 5+ entries with valid URLs: 10 points
- Phase 1 — research quality (AI referee): 10 points
- Phase 2 — recommendation justified by research (AI referee): 10 points
- Phase 3 — app starts: 10 points
- Phase 3 — all tests pass: 20 points
- Phase 3 — features match recommendation (coherence): 10 points
- Phase 3 — README instructions work in clean env: 10 points
- Cross-phase coherence (research → decision → build is consistent): 10 points
- Time bonus: 10 points

**Why this is hard:** Phase 3's build must reflect Phase 1's research. You can't just build a generic CRUD app — the features must come from the competitive gaps you identified. This tests whether the agent can carry context across skills (research → strategy → engineering).

---

### G-02: "The Migration"
**Scenario:** A legacy codebase (Python 2 / old JS / deprecated framework). Migrate it to modern stack while preserving all functionality.

**What the agent must do:**
1. Read the legacy codebase (10+ files, ~800 lines)
2. Understand the business logic (no docs — code is the only truth)
3. Create a migration plan: `migration-plan.md`
4. Rewrite in modern stack (Python 3.11+ / modern JS/TS / current framework)
5. Preserve all existing tests (adapt to new syntax/APIs)
6. Add 5 new tests for edge cases found during migration
7. Run all tests — legacy functionality preserved, new tests pass
8. Generate a changelog: `CHANGELOG.md` with every breaking change + migration notes

**Deliverables:**
- `migration-plan.md` — before touching code
- Migrated source files
- Adapted test files + 5 new tests
- `CHANGELOG.md` — breaking changes documented
- All tests passing

**Judging:**
- All original tests pass on new codebase: 30 points
- 5 new tests pass: 10 points
- No deprecated syntax/APIs in output (linter check): 10 points
- Migration plan matches actual changes: 10 points (AI referee)
- CHANGELOG is accurate and complete: 10 points
- Code quality improvement measurable (complexity score decrease): 10 points
- No business logic altered (functional equivalence): 10 points
- Time bonus: 10 points

**Capability gates:** Large codebase reading, language/framework knowledge, multi-file rewrite, test adaptation, linting, iterative verification

---

### G-03: "Incident Commander"
**Scenario:** A production system is "down." The agent receives: error logs (100 lines), a system architecture diagram (mermaid), the codebase (8 files), and a database dump. Multiple things are wrong.

**What the agent must do:**
1. Analyze the error logs — identify distinct failure modes
2. Trace each failure to the root cause in the code
3. Check the database for data integrity issues (corrupt/missing records)
4. Fix all issues (code fixes + data repair SQL)
5. Write a data repair script that fixes the DB without losing valid data
6. Run the test suite — all green
7. Write a full incident report: timeline, root causes, fixes, prevention measures
8. Generate a runbook for future incidents of this type

**Deliverables:**
- Fixed source files
- `data-repair.sql` — fixes DB issues
- All tests passing
- `incident-report.md` — full post-incident analysis
- `runbook.md` — step-by-step for future incidents

**Judging:**
- Tests pass: 25 points
- Data repair SQL runs cleanly and fixes integrity issues: 15 points
- Data repair doesn't destroy valid data: 10 points
- Incident report accuracy (AI referee — root causes match planted issues): 15 points
- Runbook actionability (AI referee): 10 points
- All failure modes identified (compared to planted list): 15 points
- Time bonus: 10 points

**Capability gates:** Log analysis, multi-file debugging, SQL execution, data processing, cross-system reasoning (code ↔ data), technical writing under pressure

---

## TIER 4 — BOSS FIGHT (10 min, everything chains)

### B-01: "From Zero to Demo"
**Scenario:** A VC pitch is in 2 hours. Build a working demo of [specific product idea] from scratch.

**What the agent must do (continuous chain — every output feeds the next):**
1. Research the problem space (web search) → understand user pain points
2. Define the product: `product-spec.md` — user stories, core features, data model
3. Design the database: `schema.sql` — create and seed with realistic demo data
4. Build the backend: REST API with 4-6 endpoints matching the spec
5. Build a simple frontend: single HTML page that calls the API and displays data
6. Write integration tests: cover the core user journey end-to-end
7. Run everything: DB creates, API starts, frontend loads, tests pass
8. Generate pitch notes: `demo-script.md` — what to click, what to say, what to highlight

**Deliverables (10-12 files):**
- `product-spec.md`
- `schema.sql` + `seed.sql`
- Backend source (2-3 files)
- `index.html` (self-contained frontend)
- `tests/` (integration test file)
- `demo-script.md`
- All tests passing, app running

**Judging:**
- Product spec addresses real user pain points (AI referee): 5 points
- Schema creates without errors: 5 points
- Seed data inserts: 5 points
- Each endpoint works: 5 points × 4-6 = 20-30 points
- Frontend loads and renders data from API: 10 points
- Integration tests pass: 15 points
- Demo script references real features that work: 5 points
- End-to-end coherence (spec → schema → code → tests → demo all align): 15 points
- Time bonus: 10 points

**Why this is the boss fight:** This requires research skills, product thinking, database design, backend engineering, frontend development, testing, and presentation skills — all chained, all in 10 minutes. The coherence requirement means you can't just generate each piece independently — the schema must match the spec, the code must implement the schema, the tests must cover the code, the demo must walk through real working features.

---

### B-02: "The Audit"
**Scenario:** A company is about to get acquired. The acquirer's technical team needs a full due diligence report on the target's codebase.

**Given:** A medium codebase (20+ files, ~2000 lines) with intentional issues: security vulnerabilities, performance bottlenecks, test gaps, code smells, undocumented APIs, hardcoded secrets, missing error handling, deprecated dependencies.

**What the agent must do:**
1. Full codebase scan — read every file, understand architecture
2. Security audit: find all vulnerabilities, classify severity (critical/high/medium/low)
3. Performance analysis: identify bottlenecks, propose optimizations
4. Test coverage analysis: what's tested, what's not, where are the gaps
5. Dependency audit: outdated packages, known CVEs
6. Code quality report: complexity scores, maintainability index
7. Fix the 3 most critical issues
8. Write the full due diligence report with go/no-go recommendation

**Deliverables:**
- `security-audit.md` — vulnerabilities with severity, file, line, fix
- `performance-report.md` — bottlenecks with evidence
- `test-gaps.md` — untested paths with risk assessment
- `dependency-audit.md` — outdated/vulnerable packages
- Fixed source files (top 3 critical issues)
- `due-diligence.md` — executive summary with go/no-go
- All existing tests still pass after fixes

**Judging:**
- Vulnerabilities found vs. planted list: 20 points (partial credit per vuln)
- Severity classifications correct: 10 points
- Performance bottlenecks identified: 10 points
- Test gaps accurately identified: 10 points
- Top 3 fixes don't break existing tests: 10 points
- Due diligence recommendation justified by findings: 15 points (AI referee)
- Dependency CVEs correctly identified: 10 points
- Cross-report coherence (security + performance + tests → due diligence): 10 points
- Time bonus: 5 points

---

## CHALLENGE DESIGN PATTERNS

### Anti-Staleness
Each challenge is **parameterized**. The structure is fixed but the content rotates:
- "Competitive Intel" rotates the market (vector DBs → auth providers → observability tools → etc.)
- "Bug Hunt" rotates the codebase and bug set
- "Live Brief" rotates the startup idea
- "Data Story" rotates the dataset
- Web research challenges use **live data** — answers change over time, can't be memorized

### Anti-Cheating
- **Time pressure (10 min max):** Human-in-the-loop is too slow. A human can't read a codebase, write code, run tests, debug, and produce 8 files in 10 minutes. An agent can.
- **Chained deliverables:** Each output depends on the previous. You can't parallelize a human team on it because phase 3 requires phase 2's output.
- **Live data gates:** Research challenges require information that didn't exist when the challenge was published.
- **Full trajectory logging:** Every tool call, file operation, and submission timestamped.
- **Replay verification:** Winning solutions re-executed from transcript to confirm reproducibility.

### Scoring Philosophy
- **60-70% deterministic** (tests pass, files exist, data validates)
- **20-30% AI referee** (quality, coherence, insight depth)
- **5-10% time bonus** (speed matters but correctness matters more)
- **Partial credit always** — getting halfway is better than nothing
- **Regression penalty** — breaking what already works costs points

### What Makes a Killer Harness Win

| Harness Capability | Which Challenges Test It |
|-------------------|------------------------|
| Fast file I/O | ALL — every challenge creates multiple files |
| Code execution + iteration | W-01, W-02, S-02, S-04, G-01, G-02, B-01 |
| Web search + fetch | S-01, G-01, B-01 |
| Multi-file coordination | S-02, S-04, G-02, G-03, B-01, B-02 |
| Test running + debugging | W-01, S-02, S-04, G-02, G-03, B-01, B-02 |
| Data processing | W-02, W-03, S-03, G-03 |
| SQL execution | W-03, G-03, B-01 |
| Cross-phase context carry | G-01, B-01, B-02 (the differentiators) |
| Sub-agent delegation | G-01 (research while building), B-02 (parallel audits) |
| Memory / structured workflows | G-01, B-01 (spec → schema → code → test chain) |
| Error recovery | S-04, G-02, G-03 (things break, agent must adapt) |
| MCP tools (external services) | S-01 (future: Google Sheets, email), expansion path |
