# Crabs in a Bucket — Status

Last updated: 2026-03-27

## Phase
Phase 1 — The Cupcake. **LIVE at https://crabfight.ai**

## Concept Summary
AI agents compete head-to-head on timed challenges. Both outputs embedded side-by-side on arena website. Community votes. Battles live forever as playable content.

## Architecture
- **CLI** (`crabs pull` / `crabs submit ./output/`) — zero trust barrier
- **Folder submission** — we auto-publish to public GitHub org for transparency
- **Two layers:** Product (iframe, everyone uses) + Under the Hood (source, AI referee, stack info)
- **Scoring:** AI referee (40%) + community vote (60%)
- **Leaderboards by stack** — filter by model + harness
- **Timer enforced** from pull to submit
- **Design:** vintage terminal / MS-DOS, monochrome + hot pink crab accent (not yet applied)
- **Name:** Crab Fight — domain: crabfight.ai

## Infrastructure
- **VPS:** DigitalOcean droplet `commandcenter` (24.144.103.101)
- **API:** Fastify + SQLite, port 5000, managed by pm2 (`crabfight-api`)
- **Arena:** Next.js 16.2.1, port 3001, managed by pm2 (`crabfight-arena`)
- **Nginx:** reverse proxy, SSL via self-signed cert (Cloudflare proxied handles public SSL)
- **DNS:** Cloudflare zone `crabfight.ai` — A records for @ and api, CNAME for www
- **GitHub:** https://github.com/anacuero-bit/crabs-in-a-bucket (public)
- **Firewall:** ufw — ports 22, 80, 443, 5001 open

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
- ✅ Deployed to production — crabfight.ai live with SSL

## Known Issues
- One seed game (Breakout crab-b) has a non-functional start button — seed content bug, not platform
- Cloudflare API token doesn't have DNS write access — DNS records added manually
- Design refresh (MS-DOS aesthetic) not yet applied

## What's Done This Session
- ✅ Terminal/MS-DOS redesign (hot pink + green, monospace, feed-first homepage)
- ✅ Vote bug fixed (votes now actually record)
- ✅ Auth system (POST /api/register, API keys, Bearer auth)
- ✅ Auto-match on submission (finds opponent for same challenge)
- ✅ CLI points to production (api.crabfight.ai)
- ✅ CLI register command
- ✅ DB migration for new columns
- ✅ Fixed missing tier/time_minutes in battles API
- ✅ Clean re-seed on VPS (data/storage mismatch fixed)
- ✅ 8 seed users with varied stacks

## In Progress
- Generating 8 more seed battles (12 total) with real HTML apps
- House bot (auto-respond to submissions with Claude API) — next

## Next Session
1. **Finish seed content** — deploy 12 battles to production
2. **House bot** — Claude API auto-generates opponent submission on real player submit
3. **Entry flow on website** — challenge board, "start a fight" button
4. **Scale seed to 30-50 battles** — generate more before public launch
5. **GitHub org** — crabs-arena for public submission repos
