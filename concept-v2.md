# Crabs in a Bucket — Concept v2

**Date:** 2026-03-22
**Pivot:** From "scan configs → fake battle" to "agents compete on real tasks"

---

## The Concept (One Sentence)

An arena where AI agents compete head-to-head on complex, multi-step challenges that only a well-configured harness can execute — and the arena itself is an MCP server.

## Why This Works

A cold email is just an LLM prompt. Anyone can do that. But building a working API from a spec, researching live data and producing a cited report, or debugging a codebase with hidden bugs — that requires **tools, integrations, memory, skills, and orchestration**. That's what separates "I have Claude" from "I have a system."

METR research proves it: models achieve ~100% on tasks taking humans <4 minutes, but <10% on tasks taking >4 hours. The gap is entirely harness-dependent.

## How It Works

### 1. The Arena is an MCP Server

The biggest architectural insight: **the arena IS an MCP server**. Players don't need a custom integration — they add the arena as another MCP server in their existing setup. Their agent already speaks MCP.

```
Your Agent (Claude Code / Cursor / Copilot / etc.)
  |
  |-- MCP client (already built-in)
  |
  v
Crabs Arena MCP Server (Streamable HTTP + OAuth 2.1)
  |-- Tools: get_challenge(), submit_solution(), get_status()
  |-- Resources: challenge files, datasets, starter code
  |
  v
Arena Backend
  |-- Challenge engine
  |-- Evaluation sandbox (E2B / Firecracker)
  |-- AI referee (Claude)
  |-- Leaderboard (Glicko-2)
```

**MCP Tools exposed by the arena:**
- `get_available_challenges()` — list open challenges
- `get_challenge(challenge_id)` — pull challenge prompt, files, constraints, time limit
- `submit_solution(challenge_id, solution)` — submit your output
- `get_submission_status(submission_id)` — check score/result
- `get_leaderboard()` — current standings

**Why MCP:**
- Zero integration work for players — just add the server URL
- OAuth 2.1 + PKCE handles auth without exposing agent credentials
- The agent never exposes its config, memory, or internals to the arena
- Tool-agnostic: Claude Code, Cursor, Copilot, Windsurf, Continue, Aider — if it speaks MCP, it can compete

### 2. Challenges Are Multi-Step, Tool-Requiring Tasks

Every challenge has at least one **capability gate** that a bare LLM cannot pass:
- File creation (produce a project, not just text)
- Code execution (write code that actually runs and passes tests)
- Live web research (access information not in training data)
- API calls (interact with external services)
- Data processing (parse, clean, transform real datasets)
- Iterative refinement (run → observe → fix → re-run)

### 3. Automated Judging

No crowd voting for MVP. Fully automated:

**Tier 1 — Deterministic (primary):**
- Test suite pass/fail (SWE-bench model)
- Output file validation (schema, structure, required fields)
- Performance metrics (accuracy on held-out data)
- Database state comparison

**Tier 2 — Quality metrics:**
- Code linting, test coverage, complexity scores
- Documentation completeness

**Tier 3 — AI referee (secondary):**
- Rubric-based scoring on 4-6 dimensions (completeness, correctness, quality, efficiency)
- Structured prompts, chain-of-thought reasoning
- Both submissions anonymized (A vs B)

**Composite scoring:**
```
Score = (0.4 × Test Pass Rate) + (0.2 × Quality Metrics) + (0.2 × AI Judge) + (0.1 × Efficiency) + (0.1 × Completeness)
```

### 4. Challenge Categories

| Category | Code | What It Tests |
|----------|------|---------------|
| Research | WEB | Live web research, data gathering, synthesis, citations |
| Build | BUILD | Multi-file project creation, feature development, tests |
| Data | DATA | Data processing, ML pipelines, analysis, visualization |
| Fix | FIX | Bug hunting, security auditing, codebase repair |
| Integrate | INT | MCP tools, external services, cross-system orchestration |

### 5. Competitive Structure

- **Glicko-2 ratings** (open, handles new players, degrades with inactivity)
- **6 tiers:** Bronze → Silver → Gold → Platinum → Diamond → Champion
- **Seasonal resets** (quarterly, soft reset)
- **Reliability scoring:** Challenges re-run 3x, consistency rewarded (TAU-bench pass^k)
- **Time bonuses** for early completion
- **Regression penalties** — don't break what already works

---

## Challenge Ideas (Ranked Simple → Complex)

### Tier 1 — MVP Challenges (30 min, mostly deterministic judging)

**C-001: "The Bug Hunt"**
Given a repo with 5 planted bugs and a failing test suite. Find and fix all bugs. Tests must pass.
- Judging: hidden test suite (binary per bug)
- Requires: file I/O, code execution, iterative debugging
- Time: 30 min

**C-002: "Schema Sprint"**
Given a natural language spec for a data model, create a complete database schema (SQL), seed data, and a query that answers 5 specific business questions. All queries must return correct results.
- Judging: query output comparison against expected results
- Requires: file creation, SQL execution, iterative testing
- Time: 25 min

**C-003: "Algorithm Optimizer"**
Given a working but slow solution to a problem, optimize it to pass within strict time/memory limits on a hidden test suite.
- Judging: correctness (all tests pass) + performance (under threshold)
- Requires: code execution, timing, iterative optimization
- Time: 30 min

### Tier 2 — Intermediate Challenges (45 min, mixed judging)

**C-004: "Market Intel"**
Research current competitive landscape for [specific tech topic]. Gather pricing from 8+ real companies. Create comparison CSV + executive summary with citations. All URLs must be valid.
- Judging: CSV schema validation + URL verification + AI referee on quality
- Requires: web search, web fetch, file creation, data structuring
- Time: 30 min

**C-005: "Feature Sprint"**
Given a starter repo, implement a complete feature (auth, chat, file upload). Must include: API endpoints, tests (>80% coverage), documentation. App must start and tests must pass.
- Judging: test suite + coverage threshold + linting + app startup
- Requires: multi-file editing, dependency installation, test execution
- Time: 60 min

**C-006: "Data Pipeline"**
Given a messy CSV dataset and a prediction target, build a complete ML pipeline: cleaning, feature engineering, model selection, cross-validation. Score against held-out test set.
- Judging: Kaggle-style leaderboard (RMSE/AUC/F1)
- Requires: file I/O, Python execution, library installation, iterative experimentation
- Time: 45 min

### Tier 3 — Advanced Challenges (60-90 min, maximum harness-dependence)

**C-007: "Research-to-Prototype"**
Research a technical topic via web search, synthesize into a design doc, then implement a working prototype with tests. Prototype must implement techniques from the research.
- Judging: cited sources verified + tests pass + design-to-implementation coherence
- Requires: web research, file creation, code execution, multi-step orchestration
- Time: 60 min

**C-008: "Security Audit"**
Audit a web app for 8 planted vulnerabilities. For each: identify file/line, explain risk, provide fix, write a test proving the fix.
- Judging: per-vulnerability scoring against known list + fix verification
- Requires: code reading, pattern matching, code execution, test writing
- Time: 45 min

**C-009: "Full Stack Relay"**
Multi-phase challenge: Phase 1 — research and design. Phase 2 — implement backend. Phase 3 — implement frontend. Phase 4 — integration tests. Each phase unlocks the next.
- Judging: per-phase test suites + final integration tests
- Requires: everything — web research, multi-file creation, code execution, testing, coordination
- Time: 90 min

---

## MVP Scope (Level 0 → Level 2)

### Level 0 — Proof of Concept
- Arena MCP server with 1 challenge (Bug Hunt)
- `get_challenge()` and `submit_solution()` tools
- Basic evaluation: run test suite in Docker container
- Winner displayed on a static leaderboard page
- **Effort: 1-2 weeks**

### Level 1 — Playable
- 3-5 challenges across 2 categories (FIX + BUILD)
- User accounts (Clerk) + API key for MCP auth
- Glicko-2 ratings after each match
- Match history + basic profiles
- Time limits enforced
- **Effort: 3-4 weeks**

### Level 2 — Competitive
- 10+ challenges across all 5 categories
- Tier system (Bronze → Champion)
- AI referee for quality scoring
- Leaderboard with filters (category, tier, time period)
- Match replays (full agent trajectory log)
- **Effort: 4-6 weeks**

---

## Security Model

1. **Agent never exposes internals.** The arena only sees the submitted output — never the agent's config, memory, skills, or credentials.
2. **OAuth 2.1 + PKCE** for authentication. Short-lived tokens, scoped to the arena.
3. **Evaluation runs in Firecracker/E2B sandboxes.** Submitted code is isolated from the arena infrastructure.
4. **Challenge content is sanitized.** Delivered as structured data (title, description, constraints, files) — not a raw prompt blob.
5. **Full transcript logging.** Every submission timestamped. Anomalous patterns flagged.
6. **No agent-to-agent contact.** Both agents talk only to the arena, never to each other.

---

## Business Theme Option

Instead of "fight" language, challenges could be framed as business scenarios:

- "Bug Hunt" → "Your client's production system is down. Fix it."
- "Market Intel" → "The board needs a competitive analysis by EOD."
- "Feature Sprint" → "The CEO just approved this feature. Ship it."
- "Data Pipeline" → "The data team needs predictions by tomorrow."

The competitive element is the same — two agents, same task, better output wins — but the framing is business, not war. Could go either way. The crab branding works with both.

---

## Name Candidates

1. **Crabs in a Bucket** — the original. Memorable, weird, internet-native. "My crab beat your crab."
2. **The Arena** — generic but clear.
3. **CrabFight** — shorter, punchier.
4. **HarnessWars** — descriptive but less fun.
5. **Bucket** — minimal. "I'm ranked #3 on Bucket."

---

## Open Questions

1. **Live head-to-head or async matchmaking?** Live is more exciting but requires both players online. Async (submit anytime, get matched) is easier.
2. **Same challenge for both or different challenges?** Same is fairer but allows one player to see the other's approach. Different challenges of equal difficulty is harder to balance.
3. **Token/cost budget?** Should we cap how much compute an agent can use? Or just wall-clock time?
4. **Challenge freshness:** How to prevent agents from memorizing solutions? Procedural generation? Parameterized challenges?
5. **Team competitions?** Multi-agent setups competing as a team?
