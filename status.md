# Crabs in a Bucket — Status

Last updated: 2026-03-25

## Phase
Phase 1 — The Cupcake. MVP built locally. Needs clean server verification + deploy.

## Concept Summary
AI agents compete head-to-head on timed challenges. Both outputs embedded side-by-side on arena website. Community votes. Battles live forever as playable content.

## Architecture
- **CLI** (`crabs pull` / `crabs submit ./output/`) — zero trust barrier
- **Folder submission** — we auto-publish to public GitHub org for transparency
- **Two layers:** Product (iframe, everyone uses) + Under the Hood (source, AI referee, stack info)
- **Scoring:** AI referee (40%) + community vote (60%)
- **Leaderboards by stack** — filter by model + harness
- **Timer enforced** from pull to submit
- **Design:** vintage terminal / MS-DOS, monochrome + hot pink crab accent
- **Name candidate:** Crab Fight

## What's Built
- ✅ CONCEPT.md — final concept with two-layer model + folder submissions
- ✅ PITCH.md — sent to Santiago Restrepo (AI Sherpa) from manuel@alphatype.co
- ✅ ROADMAP.md — 5-phase plan (YC + Lean Startup methodology)
- ✅ challenges-v3.md — 13 challenges across 4 tiers
- ✅ CLI tool (cli/) — 5 commands, Commander.js, tested against API
- ✅ Arena API (api/) — Fastify + SQLite, all endpoints, Glicko-2, mock AI referee, 3 challenge templates
- ✅ Arena website (arena/) — Next.js, wired to API, battle viewer + voting + Under the Hood
- ✅ Seed content (seed/) — 8 HTML apps (Breakout, JSON Formatter, Typing Game, Color Palette × 2)
- ✅ Seed data — 4 battles, 8 submissions, 400 votes in database
- ✅ API response normalizer — website handles both flat and nested API shapes
- ✅ start.sh — startup script for both servers
- ✅ HOW-TO-RUN.md — local setup instructions

## Known Issues
- Zombie Node processes held ports during session — need clean restart to verify full end-to-end
- Manuel saw homepage but iframes may not have rendered (file serving path needs verification)
- .env.local points to localhost:5000 (API confirmed working with nested data on that port)

## Next Session
1. **Clean restart** — kill all Node, start API on 5000, website on 5001, verify iframes render
2. **Fix any file serving issues** — submission HTML must load in iframes
3. **Apply design refresh** — MS-DOS / terminal aesthetic, hot pink crab accent
4. **External setup** — Supabase, Vercel, GitHub org (crabs-arena), domain
5. **Deploy live** — Phase 1 cupcake goes public
6. **Begin Phase 2** — First 10 Users outreach (r/ClaudeAI, r/cursor, AI Discords)
