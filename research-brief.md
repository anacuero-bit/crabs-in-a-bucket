# Crabs in a Bucket — Research Brief

**Date:** 2026-03-22
**Session:** First research session
**Status:** Complete — 6 areas researched via live web search

---

## 1. Competitive Landscape

**Verdict: No existing product combines all three pillars** (config scanning + avatar generation + PvP battles). The concept is novel.

### Closest Analogues

| Product | What It Does | Closeness | Key Lesson |
|---------|-------------|-----------|------------|
| **Google AI Arena** (Gemini competition) | Players define characters, AI generates avatars + AI-refereed battles | HIGH — but characters are user-invented, not derived from real configs | Proves AI-generated character + AI-refereed battle loop works |
| **Agent Arena** (Berkeley) | AI agent configs matched head-to-head on tasks, ELO-style ratings | HIGH — the "competitive comparison" side without the game layer | Component-level ELO (rating models, tools, frameworks separately) is directly applicable |
| **GitHub Agent HQ / "Coding Colosseum"** | Multiple AI agents run in parallel on same task, compare outputs | MEDIUM-HIGH — uses "battle" metaphor but is a productivity tool, not a game | Developers already want to pit setups against each other |
| **LMSYS Chatbot Arena** | Blind LLM battles, 6M+ votes, ELO rankings | MEDIUM — compares base models, not user configurations | Blind voting + ELO is the gold standard |
| **Habitica** | Real-life tasks → RPG stats + PvP | MEDIUM — proves "real-world → RPG stats" works at scale | Stat-mapping system is a proven design pattern |
| **SWE-bench** | AI coding agents solve GitHub issues, leaderboard | MEDIUM — evaluates harness+model combinations | Validates that configurations produce meaningfully different results |
| **Pacsmart** | Gamified Arch Linux package manager with RPG stats | LOW-MEDIUM — gamifies a real dev tool config | Developers enjoy gamification of their actual tool environment |

### Gap Analysis

- AI agent head-to-head battles → exists (Agent Arena, LMSYS)
- ELO/ranking for AI configs → exists (Agent Arena)
- Real-world profile → RPG stats → exists for non-dev (Habitica)
- Dev tool config as game input → barely exists (Pacsmart only)
- Config-derived fighting avatars → **does not exist**
- PvP game layer on tool comparison → **does not exist**
- All combined → **this is the gap**

### Validation
Harness engineering research (Anthropic, OpenAI, arXiv) confirms configurations produce wildly different performance profiles — the "stats" would be real and defensible, not arbitrary.

---

## 2. Avatar Generation from Structured Data

### Recommended Approaches (3 tiers)

**Tier 1 — Quick & High Quality (MVP):**
LLM-powered attribute-to-prompt translator + GPT Image 1.5 API ($0.04/image). Map attributes to visual descriptions ("47 skills" → "complex multi-tool belt with 47 glowing instruments"), generate with AI image model. Partial determinism via seed parameter.

**Tier 2 — Maximum Control & Determinism (Production):**
HashLips art engine with custom-commissioned layer assets. Each data dimension (skills, memory, integrations, automation) becomes a layer folder with variants. Perfectly deterministic, fully branded, zero per-image cost after initial art investment. Proven at scale (millions of NFT collections).

**Tier 3 — Best Balance:**
Custom DiceBear style (designed in Figma, exported as SVG). Each visual component maps to a data attribute. Free, perfectly deterministic, lightweight SVG. Can enhance with AI upscaling.

### Image Generation API Comparison

| API | Cost/Image | Quality (ELO) | Determinism | Best For |
|-----|-----------|---------------|-------------|----------|
| GPT Image 1.5 | $0.04 | 1264 | Partial (seed) | Fastest MVP |
| Flux 2 Pro | $0.055 | 1265 | Partial | Self-host option |
| Stable Diffusion 3.5 | $0.01-0.065 | Good | Good (seed+LoRA) | Maximum customization |
| Midjourney V7/V8 | $10-60/mo | Best aesthetics | Low | Manual workflow only |

### Key Decision
For MVP: LLM prompt mapping + GPT Image 1.5 or Flux 2. For production: commission custom layer art + HashLips engine for perfect determinism and zero marginal cost.

---

## 3. Battle Simulation Engines

### Recommended Architecture

**4-Phase Combat System:**

| Phase | Name | Dominant Stats | What Happens |
|-------|------|---------------|-------------|
| 1 | Stratagem | Intelligence ×3, Speed ×1 | Tactical advantage, positioning, formation |
| 2 | Army Clash | Army Size ×3, Strength ×1, Defense ×1 | Main force engagement |
| 3 | Heroes' Duel | Strength ×2, Speed ×2, Defense ×1 | Avatar-vs-avatar combat |
| 4 | Last Stand | Defense ×2, Special Abilities ×3 | Final stand, ability triggers |

**Damage Formula (recommended):**
```
phaseScore = sum(avatar[stat] * phase.weights[stat])
phaseDamage = baseDamage * (attackerScore / defenderScore) ^ 0.7 * seededRandom(0.85, 1.15)
```
- `^0.7` compression prevents blowouts
- Seeded PRNG = deterministic but varied
- Special abilities trigger as phase modifiers

### Combat Resolution Models

| Model | Complexity | Best For |
|-------|-----------|----------|
| Super Auto Pets (linear clash) | Low | Simple 1v1 |
| Pokemon-style formula | Medium | Stat-ratio battles |
| Lanchester's Laws | Medium | Army-size combat (force² advantage) |
| Azgaar Fantasy (phased with unit-type modifiers) | Medium-High | Multi-stage narrative battles |

### Narrative Generation
**Hybrid approach recommended:** Deterministic simulation produces all mechanical outcomes → structured battle log → LLM (Claude Haiku) generates engaging narration per phase. Templates for common events, LLM for dramatic moments.

### Visual Presentation
**Phaser 3** recommended for battle animations (274KB, built-in tweens, particles, health bars). PixiJS as lighter alternative (125KB) if custom game logic is preferred.

---

## 4. Architecture Scanning

### Per-Tool Config Accessibility

| Tool | Project Rules | Global Rules | MCP | AI Can Self-Read | Hooks |
|------|--------------|-------------|-----|------------------|-------|
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` | `.mcp.json` | Fully | Yes (6+ events) |
| Cursor | `.cursor/rules/*.mdc` | Settings UI only | Yes | Partially | Limited |
| Copilot/CLI | `.github/copilot-instructions.md` | `$HOME/.copilot/copilot-instructions.md` | Yes | Yes | No |
| Windsurf | `.windsurfrules` | `global_rules.md` | Partial | Partially | No |
| Continue | `.continuerc.json` | `~/.continue/config.yaml` | Yes | Yes | No |
| Aider | `CONVENTIONS.md` | `~/.aider.conf.yml` | No | Yes | Yes (lint/test) |

### What CAN Be Auto-Extracted
- Project-level instruction files
- MCP server configurations
- Hooks configurations
- Permission rules
- Custom slash commands / skills / subagent definitions
- File existence checks for all known config paths

### What CANNOT Be Auto-Extracted
- UI-only settings (Cursor global rules, Windsurf model selection)
- Organization/enterprise policies
- Internal AI memories (Windsurf Cascade)
- API keys (should not be extracted)
- Usage patterns vs. configured-but-unused features

### Anti-Gaming Measures
1. Output raw file contents or hashes, not prose summaries
2. Timestamp + tool version pinning
3. Distinguish "configured" from "actually used"
4. Machine-readable JSON/YAML output
5. File existence verification (note what's absent, not just present)
6. Read-only scanning only

### Recommended Approach
Per-tool scanner module that knows exact file paths + CLI commands, with a shared output schema. The "single prompt" detects which tool it's running inside and executes the appropriate module.

---

## 5. Competitive Gaming UX

### Rating System: Glicko-2
Best for 1v1. Open/free, handles new players well via Rating Deviation, degrades gracefully with inactivity. Industry standard for browser-based competitive platforms. Open-source libraries available in JS/TS/Python/Rust.

### Tier System (simplified for smaller player base)
Bronze → Silver → Gold → Platinum → Diamond → Champion (6 tiers, 3 divisions each). LP gains calibrated by gap between visible rank and hidden MMR.

### Season Mechanics
- Quarterly seasons with themed challenges
- Soft reset: `new_MMR = (old_MMR + baseline) / 2`
- 5-10 placement matches at season start
- Seasonal rewards = exclusive avatar skins, badges, titles

### Engagement Loops (priority order)
1. Daily challenges (+30% DAU)
2. Streak rewards (60% higher retention)
3. First win of the day bonus
4. Leaderboards (daily/weekly/seasonal)
5. Milestone rewards (10/50/100/500 games)

### Unique Advantage
Since matches are async (AI configs battling), **no queue time constraint**. Can prioritize match quality over speed — find optimal opponents from entire player pool.

### Social Features (P0)
- Shareable "battle cards" (great for Twitter/X)
- Friends list + challenge system
- Player profiles with stats/history/badges
- Global + friends leaderboards

### Key Inspirations
- **Pokemon Showdown**: Browser-based, config-driven (team = config), multiple formats, open source — study their ladder code
- **Super Auto Pets**: Arena mode ("10 wins before 3 losses") — perfect for config battles
- **Chess.com**: Multiple engagement surfaces beyond core gameplay (puzzles, daily challenges, streaks)

---

## 6. Tech Stack Recommendation

### Recommended Stack

```
Frontend:       Next.js 15 (App Router) + TypeScript
Game Rendering: PixiJS 8 + @pixi/react
Backend:        Node.js + Express/Fastify + Socket.io
Database:       Supabase (PostgreSQL) + Redis (Upstash)
Real-Time:      Socket.io (rooms for battles, namespaces for features)
Auth:           Clerk
Hosting:        Vercel (frontend) + Fly.io (game server)
AI:             Claude API (Haiku for narration) + Replicate/Flux (avatar generation)
```

### Why Each Choice

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 15 | Largest React ecosystem, Server Components for non-game pages, PixiJS integration |
| Game Rendering | PixiJS 8 | 3x smaller than Phaser, 2x faster, official React bindings, WebGPU support |
| Backend | Node.js + Socket.io | Same language (TS), rooms for battle sessions, fastest to MVP |
| Database | Supabase + Upstash Redis | Managed Postgres + real-time + auth bundle; Redis Sorted Sets for leaderboards |
| Auth | Clerk | Fastest Next.js integration, 10K MAU free, pre-built UI components |
| Frontend Host | Vercel | Zero-config Next.js deployment, edge CDN |
| Game Server Host | Fly.io | Global edge VMs, persistent WebSocket connections |
| Battle Narration | Claude Haiku | Fast (<1s), cost-effective, structured prompts |
| Avatar Generation | Replicate/Flux | $0.014-0.055/image, self-host option |

### Cost Estimate (MVP, <1000 users)

| Service | Monthly |
|---------|---------|
| Vercel Pro | $20 |
| Fly.io (2 VMs) | $10-15 |
| Supabase | $0-25 |
| Upstash Redis | $0 |
| Clerk | $0 |
| Claude API | $5-20 |
| Image generation | $10-30 |
| **Total** | **$45-110/mo** |

---

## Key Design Questions — Research-Informed Answers

### Theme/aesthetic?
**Recommendation: Sci-fi / mech pilot.** Fits the tech/AI context naturally. Structured data maps well to "mech loadout" visuals (weapons = skills, shields = defense, sensor arrays = integrations). More visually distinctive than corporate or military.

### Real-time visual battles or text-based narrative?
**Recommendation: Both.** Deterministic simulation engine produces a battle log. PixiJS renders animated playback. Claude Haiku generates narrative commentary. User can watch the visual battle or read the narrative — different consumption modes for different audiences.

### How to prevent gaming the prompt?
**Recommendation:** Scan actual config files (checksums/hashes), not self-reports. Machine-readable JSON output. File existence verification. Distinguish "configured" from "used." Read-only scanning.

### How to make non-technical spectators enjoy watching?
**Recommendation:** AI-generated commentary that translates technical matchups into plain language. Visual health bars, attack animations, dramatic phase transitions. Shareable battle cards with highlights. The narrative layer is what makes it accessible.

### Monetization angle?
**Recommendation (phased):**
1. Free-to-play with cosmetic monetization (avatar skins, battle effects, profile badges)
2. Battle Pass ($5-10/season) with exclusive cosmetics
3. Premium features (detailed analytics, replay exports, priority matchmaking)
4. Tournament entry fees (later)

### MVP scope?
See next section.

---

## MVP Proposal

### What's in the MVP

1. **Scanner prompt** — Claude Code only (our own tool, most accessible). Outputs standardized JSON.
2. **Stat engine** — Maps JSON architecture to 6 stats: Strength, Speed, Intelligence, Defense, Army Size, Special Abilities.
3. **Avatar generator** — LLM prompt mapping + Flux/GPT Image 1.5. One profile portrait per config.
4. **Battle simulator** — 4-phase deterministic combat with seeded PRNG. Text-based narration (Claude Haiku).
5. **Web app** — Next.js. Upload your scan → see your avatar + stats → challenge someone → watch battle narration.
6. **Leaderboard** — Glicko-2 rating, basic tier display, player profiles.

### What's NOT in the MVP
- Multi-tool scanning (Cursor, Copilot, etc.) — add later
- Visual battle animations (PixiJS) — text narration first
- Social features beyond leaderboard
- Seasons, battle pass, daily challenges
- Clans/guilds
- Spectator mode

### MVP Components

| Component | Effort | Priority |
|-----------|--------|----------|
| Scanner prompt (Claude Code) | 3-5 days | P0 |
| Stat mapping engine | 2-3 days | P0 |
| Battle simulator (4-phase) | 1-2 weeks | P0 |
| Battle narration (Claude Haiku) | 3-5 days | P0 |
| Avatar generation pipeline | 1 week | P0 |
| Next.js web app (profiles, upload, results) | 2-3 weeks | P0 |
| Glicko-2 leaderboard | 1 week | P0 |
| Auth (Clerk) + user accounts | 2-3 days | P0 |
| Database (Supabase) schema | 2-3 days | P0 |

### Estimated MVP timeline: 6-8 weeks
