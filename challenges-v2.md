# Crabs in a Bucket — Challenge Design v2

**Design rules:**
- 5-10 minutes. What a good agent can ACTUALLY do in that time.
- Multi-step: 3-6 distinct tasks chained together
- Multi-capability: requires 3+ different tool types
- Fun themes: missions, not homework
- Objectively judgeable: tests pass, data matches, files exist, URLs resolve
- Parameterized: same structure, rotating content — no memorization

---

## TIER 1 — CLAWING IN (5 min, entry level)

### 1.1 "The Dossier"
**Theme:** You're an intelligence analyst. A target company just hit the news. Build a briefing for your handler.

**The prompt:**
> Your handler needs a dossier on [COMPANY — rotates: a real public company] within 5 minutes. Deliver:
> 1. `profile.json` — company name, CEO, HQ city, founding year, employee count, stock ticker (if public), one-line description. All fields required.
> 2. `news.md` — 3 recent news items about this company from the last 90 days. Each must have: headline, source, date, URL, 2-sentence summary.
> 3. `competitors.json` — 4 direct competitors with name and one-line differentiation.
> 4. `assessment.md` — one paragraph: what this company is doing right, one paragraph: biggest risk. Under 200 words total.

**Required capabilities:** Web search, web fetch, JSON creation, markdown writing, factual accuracy

**Judging (100 points):**
- `profile.json` schema valid + all fields populated: 15 pts
- `profile.json` facts correct (verified against live data): 10 pts
- `news.md` has 3 items with valid, resolving URLs: 20 pts
- News dates within last 90 days: 10 pts
- `competitors.json` schema valid + 4 real competitors: 15 pts
- `assessment.md` under 200 words: 5 pts
- `assessment.md` quality — specific, not generic (AI referee): 15 pts
- Time bonus (under 3 min): 10 pts

**Why a bare LLM fails:** Can't access current news or verify URLs exist.

---

### 1.2 "The Fixer"
**Theme:** A junior dev pushed broken code to production at 2am. You've got 5 minutes to save the deploy.

**The prompt:**
> The repo at [REPO URL] has a failing test suite. There are 3 bugs hiding in the code.
> 1. Get the tests running. Identify what's failing.
> 2. Fix all 3 bugs.
> 3. All tests must pass with zero failures.
> 4. Write `fix-log.md` — for each bug: what file, what line, what was wrong, what you changed, one sentence on why it broke.

**Required capabilities:** Git clone, file reading, code execution, test running, iterative debugging, markdown writing

**Judging (100 points):**
- Test suite passes (all green): 50 pts
- No regressions (pass-to-pass tests still pass): 15 pts
- `fix-log.md` exists with 3 entries: 10 pts
- Fix descriptions match actual changes (AI referee): 15 pts
- Time bonus: 10 pts

**Why a bare LLM fails:** Can't clone, run tests, or verify fixes work.

---

### 1.3 "The Translator"
**Theme:** A dataset arrived from a foreign partner. It's a mess. Clean it before the morning meeting.

**The prompt:**
> The file at [URL — .csv] contains 500 rows of [DOMAIN — rotates: real estate listings / restaurant health inspections / flight delays / product reviews].
> It's dirty: mixed date formats, inconsistent categories, duplicate entries, missing required fields, encoding issues.
> 1. Write a cleaning script (`clean.py` or `clean.js`)
> 2. Run it. Produce `cleaned.csv` with: all dates as YYYY-MM-DD, categories standardized, duplicates removed (keep most recent), encoding fixed to UTF-8.
> 3. Produce `rejected.csv` — rows that couldn't be cleaned, with a `rejection_reason` column.
> 4. Produce `stats.json` — total rows in, rows cleaned, rows rejected, breakdown by rejection reason.
> 5. Numbers in `stats.json` must match the actual row counts in the CSVs.

**Required capabilities:** File download, data processing, code execution, multi-format output, numerical consistency

**Judging (100 points):**
- Script runs without errors: 10 pts
- `cleaned.csv` row count matches expected: 15 pts
- Date format correct (100% YYYY-MM-DD): 15 pts
- No duplicates in cleaned output: 10 pts
- `rejected.csv` has rejection reasons: 10 pts
- `stats.json` numbers match actual CSV row counts: 20 pts
- Encoding is valid UTF-8 throughout: 10 pts
- Time bonus: 10 pts

---

## TIER 2 — CRAB WALK (7 min, intermediate)

### 2.1 "The Heist"
**Theme:** You've intercepted an encrypted message. Decode it, find the target, build the extraction plan.

**The prompt:**
> You've intercepted a Base64-encoded message. Decode it:
> `[BASE64 STRING — decodes to a JSON payload with: a company name, a product category, and 3 clues about a real-world API or service]`
>
> 1. Decode the message → save as `decoded.json`
> 2. Use the clues to identify the real service/API being described → web search to confirm
> 3. Fetch that service's actual pricing page or API docs
> 4. Write `target.json` — service name, URL, pricing tiers (at least 3), rate limits if available
> 5. Write a working script (`probe.py` or `probe.js`) that calls that service's free/public endpoint and returns real data
> 6. Run the script → save output as `proof.json`
> 7. Write `extraction-plan.md` — how you'd integrate this service into a product, estimated monthly cost for 10K users, one risk

**Required capabilities:** Base64 decoding, web search, web fetch, API integration, code execution, cost analysis

**Judging (100 points):**
- `decoded.json` matches expected decode: 10 pts
- Correct service identified: 10 pts
- `target.json` has real pricing data with valid URL: 15 pts
- Script runs and returns real data from the API: 25 pts
- `proof.json` contains actual API response: 10 pts
- `extraction-plan.md` cost estimate is reasonable (AI referee): 15 pts
- All URLs resolve: 5 pts
- Time bonus: 10 pts

**Why this is fun:** It's a puzzle. Decode → investigate → prove → plan. Each step unlocks the next.

---

### 2.2 "The Frankenstein"
**Theme:** Build a working thing from mismatched parts.

**The prompt:**
> You receive 3 code snippets in 3 different languages/formats:
> - A SQL schema (PostgreSQL) defining a data model for [DOMAIN — rotates]
> - A Python function that processes records from that schema but has 2 bugs
> - A JSON config file for an API that should serve processed results but is missing 3 required fields
>
> Make it all work together:
> 1. Create the database (SQLite — adapt the PostgreSQL syntax) and seed with 20 realistic rows → `schema.sql`, `seed.sql`
> 2. Fix the Python function → `processor.py`
> 3. Complete the JSON config → `config.json`
> 4. Write a test script that: creates the DB, seeds it, runs the processor on all rows, validates output matches expected format → `test.py`
> 5. Run the test. It must pass.
> 6. `build-notes.md` — what you changed and why, for each piece

**Required capabilities:** SQL adaptation, Python debugging, JSON completion, multi-file coordination, test writing, code execution

**Judging (100 points):**
- SQLite schema creates without errors: 10 pts
- Seed data inserts (20 rows): 10 pts
- Python processor runs without errors: 10 pts
- Processor output matches expected format: 15 pts
- Config JSON is valid and complete: 10 pts
- Test script passes: 25 pts
- `build-notes.md` accurately describes changes (AI referee): 10 pts
- Time bonus: 10 pts

---

### 2.3 "The Scout"
**Theme:** The board meets in 7 minutes. Build their entire briefing from scratch.

**The prompt:**
> The board of [FICTIONAL STARTUP — rotates: "ZapFreight, a logistics SaaS"] needs a competitive briefing on their market segment: [SEGMENT — rotates: "last-mile delivery optimization software"].
>
> Deliver:
> 1. `landscape.json` — 6+ real competitors, each with: name, URL, pricing_model, founded_year, notable_customers (if findable), key_differentiator
> 2. `matrix.csv` — comparison table: rows = competitors, columns = [5 specific features from the brief]
> 3. `trends.md` — 3 market trends with evidence (cite real articles with dates and URLs)
> 4. `threats.md` — top 2 threats to ZapFreight based on competitor strengths
> 5. `opportunities.md` — top 2 gaps in the market that no competitor fully addresses
> 6. `one-pager.md` — executive summary that ties it all together, under 300 words, references data from the other files

**Required capabilities:** Web search (multiple queries), web fetch (multiple sites), structured data creation, cross-file coherence, synthesis

**Judging (100 points):**
- `landscape.json` has 6+ entries, all URLs resolve: 15 pts
- `matrix.csv` has all competitors × all features: 10 pts
- `trends.md` has 3 trends with valid, dated source URLs: 15 pts
- Source articles are from the last 12 months: 5 pts
- `threats.md` references specific competitors from landscape.json: 10 pts
- `opportunities.md` identifies gaps not covered in matrix.csv: 10 pts
- `one-pager.md` under 300 words: 5 pts
- `one-pager.md` references data from other files correctly (AI referee): 15 pts
- Cross-file consistency (same competitor names, same data): 5 pts
- Time bonus: 10 pts

---

### 2.4 "The Rescue"
**Theme:** A full-stack app is limping. Three layers, three problems. Find them all.

**The prompt:**
> The repo at [REPO URL] is a [STACK — rotates: React+Express+SQLite / Vue+FastAPI+PostgreSQL / Svelte+Go+MongoDB] app for [PURPOSE — rotates: a todo list with teams / a booking system / an inventory tracker].
>
> It has 3 bugs spanning 3 layers:
> - A frontend rendering issue (something displays wrong)
> - A backend logic error (an endpoint returns wrong data)
> - A data layer problem (a query is incorrect or a migration is broken)
>
> 1. Get the app running.
> 2. Run the existing test suite — observe what fails.
> 3. Trace and fix all 3 bugs.
> 4. All tests must pass.
> 5. `diagnosis.md` — for each bug: which layer, which file, the root cause, and your fix. Explain how bug A in layer X caused symptom B in layer Y (trace the chain).

**Required capabilities:** Multi-language reading, app startup, test execution, cross-stack debugging, iterative fixing

**Judging (100 points):**
- All tests pass: 40 pts
- No regressions: 10 pts
- `diagnosis.md` identifies correct files/lines for all 3 bugs: 15 pts
- Root cause explanations are accurate (AI referee checks against planted bugs): 20 pts
- Cross-layer chain of causation explained: 5 pts
- Time bonus: 10 pts

---

## TIER 3 — DEATH GRIP (10 min, advanced)

### 3.1 "The Startup Machine"
**Theme:** From idea to working demo. Research, build, prove.

**The prompt:**
> A VC just asked: "What would you build in [SPACE — rotates: 'AI for restaurant menu optimization' / 'automated compliance checking for startups' / 'real-time sports betting analytics']?"
>
> You have 10 minutes.
>
> **Phase 1 — Intel (target: 3 min):**
> 1. Research existing players in this space — web search for real companies
> 2. `research.json` — 5+ competitors with name, URL, what they do, pricing
> 3. `gap.md` — one clear gap you found that nobody's filling. Under 100 words.
>
> **Phase 2 — Blueprint (target: 2 min):**
> 4. `spec.md` — product name, one-liner, 3 core features that address the gap, data model (describe the tables/collections you'd need)
> 5. Features must reference the gap from Phase 1. No generic CRUD.
>
> **Phase 3 — Proof (target: 5 min):**
> 6. Build a working API implementing the 3 core features: `app.py` or `app.js` + `schema.sql`
> 7. Seed the database with 15+ realistic rows
> 8. Write `tests.py` or `tests.js` covering all 3 features (at least 2 tests per feature)
> 9. Run tests — all must pass
> 10. `demo.md` — 3 curl commands someone can run to see it work, with expected responses

**Required capabilities:** Web research, competitive analysis, product design, database design, backend development, test writing, code execution, documentation

**Judging (100 points):**
- Phase 1: 5+ competitors with valid URLs: 8 pts
- Phase 1: `gap.md` identifies a real gap (AI referee): 7 pts
- Phase 2: `spec.md` features address the gap from Phase 1: 10 pts
- Phase 3: Schema creates + seed inserts: 8 pts
- Phase 3: API starts without errors: 7 pts
- Phase 3: Each feature endpoint works: 5 pts × 3 = 15 pts
- Phase 3: All tests pass: 15 pts
- Phase 3: `demo.md` curl commands actually work: 10 pts
- Cross-phase coherence (research → gap → features → code → tests all connected): 10 pts
- Time bonus: 10 pts

**Why this is the real test:** A bare LLM can write code. But it can't research live competitors, identify a real market gap, design features that address that specific gap, build a working implementation, write tests that pass, and produce runnable curl commands — all coherent and all in 10 minutes. That's a harness.

---

### 3.2 "The Archaeologist"
**Theme:** A repo with zero documentation. Reverse-engineer everything and prove you understand it.

**The prompt:**
> The repo at [REPO URL] is a [TYPE — rotates] application. ~800 lines across 10+ files. No README, no comments, no docs. The original developer quit.
>
> Your job: understand it completely and prove it.
>
> 1. `architecture.md` — describe what this app does, how the components connect (include a mermaid diagram), and what each file is responsible for
> 2. `api-docs.md` — document every endpoint/function: path, method, params, response format, example
> 3. `README.md` — setup instructions that actually work (someone should be able to follow them cold)
> 4. Run the app following your own README instructions. It must start.
> 5. Write `tests.py` / `tests.js` — 8 tests covering the core functionality you identified. Run them — at least 6 must pass.
> 6. `risks.md` — 3 things wrong with this codebase (bugs, security issues, performance problems, bad practices). For each: file, line, what's wrong, suggested fix.

**Required capabilities:** Large codebase reading, architecture analysis, documentation generation, test writing, code execution, security/quality analysis

**Judging (100 points):**
- `architecture.md` correctly describes what the app does (AI referee): 10 pts
- Mermaid diagram is valid and matches actual structure: 5 pts
- `api-docs.md` covers all actual endpoints (checked against code): 15 pts
- `README.md` instructions work — app starts in clean env: 15 pts
- At least 6 of 8 tests pass: 15 pts (2 pts per passing test, bonus 3 for 8/8)
- Tests cover meaningful functionality (not trivial asserts): 10 pts
- `risks.md` identifies real issues (AI referee checks against codebase): 15 pts
- All files present and properly formatted: 5 pts
- Time bonus: 10 pts

---

### 3.3 "The Mashup"
**Theme:** Two APIs. One product. Make them talk.

**The prompt:**
> Build a working tool that combines data from two real public APIs:
> - **API A:** [rotates: OpenWeather / GitHub / PokéAPI / NASA APOD / CoinGecko / Open Library]
> - **API B:** [rotates: a different one from the list]
>
> Your tool must:
> 1. Fetch real data from both APIs
> 2. Combine them in a meaningful way (not just side-by-side — actual data correlation or enrichment)
> 3. Output the combined result as `output.json` with a clear schema
> 4. Generate a human-readable summary as `report.md`
> 5. Handle errors gracefully (what if API A is down? what if a query returns empty?)
> 6. Include a test file that mocks both APIs and tests the combination logic
> 7. Tests must pass
>
> Example combos (but be creative):
> - Weather + CoinGecko → "Does Bitcoin price correlate with temperature in major trading cities?"
> - GitHub + NASA → "What were the most-starred repos created on days NASA published APOD images of Mars?"
> - PokéAPI + Open Library → "Find books whose titles match Pokémon names"

**Required capabilities:** API integration (2 different APIs), data fetching, data correlation, error handling, test writing with mocking, code execution

**Judging (100 points):**
- Both APIs successfully called with real data returned: 15 pts
- `output.json` contains data from BOTH APIs, meaningfully combined: 20 pts
- Combination is non-trivial (not just concatenation — actual correlation/enrichment): 10 pts
- `report.md` summary is human-readable and references actual data: 10 pts
- Error handling exists and works (tested): 10 pts
- Tests pass: 15 pts
- Tests actually mock APIs (not just testing with live calls): 10 pts
- Time bonus: 10 pts

---

### 3.4 "The Time Bomb"
**Theme:** A legacy codebase. A ticking clock. Modernize before it blows.

**The prompt:**
> The repo at [REPO URL] is a [TYPE] app written in [OLD STYLE — rotates: callback hell Node.js / Python 2.7 / jQuery spaghetti / PHP 5 / Ruby 1.9].
> ~600 lines. It works (tests pass on the legacy version) but it's unmaintainable.
>
> Modernize it:
> 1. Rewrite to [MODERN TARGET — rotates: async/await Node 20 / Python 3.12 / modern React / PHP 8 / Ruby 3]
> 2. All original tests must pass on your new version (adapt test syntax if needed)
> 3. Add 4 new tests for edge cases you spotted during the rewrite
> 4. Reduce cyclomatic complexity (measure with a linter — report before/after scores)
> 5. `migration.md` — what changed, what patterns you replaced, any breaking changes
> 6. `CHANGELOG.md` — formatted changelog entry

**Required capabilities:** Legacy code reading, language modernization, test adaptation, linting, complexity measurement, documentation

**Judging (100 points):**
- All original tests pass on new code: 30 pts
- No deprecated syntax (linter clean): 10 pts
- 4 new tests exist and pass: 10 pts
- Complexity score decreased (before/after measurable): 10 pts
- `migration.md` accurately describes changes (AI referee): 15 pts
- `CHANGELOG.md` present and properly formatted: 5 pts
- Functional equivalence (same inputs → same outputs): 10 pts
- Time bonus: 10 pts

---

## TIER 4 — KING CRAB (10 min, boss fights)

### 4.1 "The Full Monty"
**Theme:** Pitch day. VC walks in. You have nothing. Build everything.

**The prompt:**
> The VC wants to see a working demo of a [PRODUCT — rotates: "restaurant wait-time predictor" / "freelancer invoice generator" / "pet adoption matcher" / "parking spot finder"].
>
> You start from zero. Deliver:
> 1. `research.md` — 3 existing solutions found via web search, each with URL and one-line description. What's missing from all of them? (The gap.)
> 2. `spec.md` — your product name, tagline, 3 features that fill the gap, data model
> 3. `schema.sql` + `seed.sql` — database with 20+ realistic rows
> 4. `app.py` or `app.js` — working API with 3+ endpoints matching the spec
> 5. `index.html` — single-page frontend that fetches from and displays data from the API
> 6. `tests.py` or `tests.js` — tests for all endpoints, all passing
> 7. `demo.md` — step-by-step script: "Open the HTML. Click here. You'll see this. Now try this endpoint..."
> 8. Everything must run. The HTML must load. The API must respond. The tests must pass.

**Required capabilities:** Web research, product design, SQL, backend dev, frontend dev, test writing, code execution, cross-file coherence

**Judging (100 points):**
- Research has 3 real solutions with valid URLs: 5 pts
- Gap identification is specific (AI referee): 5 pts
- Spec features address the gap: 5 pts
- Schema creates + seed inserts: 5 pts
- API starts: 5 pts
- Each endpoint works: 5 pts × 3 = 15 pts
- HTML loads and renders data from API: 10 pts
- All tests pass: 15 pts
- `demo.md` steps are followable and accurate: 5 pts
- End-to-end coherence (research → gap → spec → schema → code → frontend → tests → demo): 15 pts
- Time bonus: 10 pts
- Bonus: 5 pts if the product name is actually good (AI referee — memorable, relevant, not cringe)

---

### 4.2 "The Sherlock"
**Theme:** Digital forensics. Piece together what happened from fragments.

**The prompt:**
> You receive 4 files:
> - `server.log` — 200 lines of application logs from a production incident
> - `schema.sql` — the database schema
> - `dump.csv` — a data export from 2 hours before the incident
> - `dump_after.csv` — a data export from after the incident
>
> Something went very wrong. Multiple things, actually.
>
> 1. `timeline.md` — reconstruct a minute-by-minute timeline of what happened, citing specific log lines
> 2. `root-causes.json` — each root cause: `{ "cause": "...", "evidence": ["log line X", "data discrepancy Y"], "severity": "critical|high|medium" }`
> 3. Write a `diff-analysis.py` script that compares the two dumps and outputs exactly what data changed, what was lost, and what was corrupted → run it → save output as `data-diff.json`
> 4. Write `repair.sql` — SQL statements to fix the corrupted data (restore what can be restored from the before dump, flag what can't)
> 5. `prevention.md` — for each root cause, a specific technical fix (not "add monitoring" — actual code/config changes)

**Required capabilities:** Log analysis, data comparison (code execution), SQL writing, forensic reasoning, multi-file cross-referencing

**Judging (100 points):**
- Timeline references correct log lines: 15 pts
- All planted root causes identified: 15 pts
- Severity classifications match expected: 5 pts
- Diff script runs and correctly identifies all changes: 20 pts
- `repair.sql` runs without errors: 10 pts
- Repair restores data correctly (verified against expected state): 10 pts
- Prevention measures are specific and address actual causes (AI referee): 15 pts
- Time bonus: 10 pts

---

### 4.3 "The Gauntlet"
**Theme:** Five tasks. Five different skills. One clock. No mercy.

**The prompt:**
> Five micro-tasks, each requiring a different capability. All must be completed.
>
> **Task A — Decode (1 min):** The string `[HEX-ENCODED JSON]` is hex-encoded. Decode it, parse the JSON, extract the `secret_word` field → `task-a.txt`
>
> **Task B — Fetch (2 min):** The decoded JSON contains a `url` field pointing to a real webpage. Fetch it, extract all email addresses found on the page → `task-b.json` (array of emails)
>
> **Task C — Compute (2 min):** The decoded JSON contains a `dataset_url` pointing to a CSV. Download it, compute: mean, median, standard deviation, and the row with the maximum value for column `[COLUMN]` → `task-c.json`
>
> **Task D — Build (3 min):** Using the dataset from Task C, build a REST endpoint that serves the top 10 rows sorted by `[COLUMN]`, with pagination support (`?page=1&limit=10`). Include a test that verifies the endpoint returns correct data → `app.py` + `test.py`, tests must pass.
>
> **Task E — Synthesize (2 min):** Write `summary.md` that: explains what the secret word means in context, lists the emails found, states the key statistics, and describes the API you built. Under 300 words. Every number must match your computed values from Task C exactly.

**Required capabilities:** Hex decoding, web fetching, email extraction, CSV processing, statistics, API building, test writing, cross-task synthesis

**Judging (100 points):**
- Task A: correct secret word: 10 pts
- Task B: all emails found (compared to expected list): 15 pts
- Task C: statistics correct within 0.1% tolerance: 15 pts
- Task D: endpoint returns correct data: 15 pts
- Task D: tests pass: 10 pts
- Task E: summary exists, under 300 words: 5 pts
- Task E: numbers in summary match Task C exactly: 15 pts
- Task E: all sections present: 5 pts
- Time bonus: 10 pts

**Why this is the ultimate test:** Five completely different skill sets, each chained to the previous. If your harness can't context-switch between decoding, web scraping, data science, API building, and writing — all in 10 minutes — it's not a killer system.

---

## CHALLENGE ROTATION SYSTEM

Every challenge is a **template** with rotating parameters:

| Challenge | What Rotates |
|-----------|-------------|
| The Dossier | Target company |
| The Fixer | Repo + bug set |
| The Translator | Dataset domain + specific dirty data |
| The Heist | Encoded payload + target API |
| The Frankenstein | Domain + schema + bugs in processor |
| The Scout | Startup name + market segment |
| The Rescue | Stack + app purpose + bug set |
| The Startup Machine | Market space |
| The Archaeologist | Repo + app type |
| The Mashup | API pair |
| The Time Bomb | Language + codebase |
| The Full Monty | Product idea |
| The Sherlock | Log content + data corruption type |
| The Gauntlet | Encoded data + dataset + target column |

A challenge instance is generated fresh for each match. Same structure, different content. No memorization possible.

---

## SCORING SUMMARY

| Component | Weight | How |
|-----------|--------|-----|
| Deterministic checks | 60-70% | Tests pass, files exist, data matches, URLs resolve, schemas valid |
| AI referee | 15-25% | Quality, coherence, accuracy of reasoning, specificity |
| Time bonus | 5-10% | Faster = more points, but correctness always beats speed |
| Partial credit | Always | Every sub-task scored independently |
