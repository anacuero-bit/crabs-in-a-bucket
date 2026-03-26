# Decisions — 2026-03-25

Responses to angel investor stress test. Manuel's calls:

## 1. Target User
Broad and expanding fast. Both professional coders optimizing their setups AND curious newcomers setting up Claude Code for the first time. The demographic is the entire AI-assisted coding wave — not a niche.

## 2. Retention
All hooks apply: competitive leaderboard climbing, Challenge of the Day, tier progression, staying up to date (is your harness still competitive?). For MVP: just make it fun. Don't overthink retention mechanics yet.

## 3. Deliverable Format
HTML-only is too limiting. Challenges need to test full-stack, multidisciplinary capabilities — frontend, backend, data, research, everything. Need complex challenges that really test the system. **This is an open design problem — how to judge non-visual output while keeping the side-by-side spectator experience.**

## 4. Cheating Prevention
Simple: timer starts on `crabs pull`, enforced on `crabs submit`. Not a concern for MVP. Just implement it.

## 5. Distribution / Leaderboards by Stack
Competitors can tag (or auto-detect) the tools they're using: which model, which IDE/harness, which MCP servers. Leaderboards can then be filtered by tool/model. "Best Claude Code setup" vs "Best Cursor setup" vs "Best Copilot setup." This creates natural tribal competition AND gives the ecosystem valuable signal about which tools perform best. Easy win.

## 6-8. Distribution, Monetization, Moat
Not focusing on these now. Build the MVP. Make it fun. If it picks up, figure out the rest. Per our own roadmap: speed over polish, cupcake first.

## Key Open Problem
**Security** — the main thing that could turn people off. Not the technical architecture (CLI is safe), but the perception: "Am I running challenge code that could be malicious?" Need to get this tight before launch. The challenge prompt is just text (safe), but if challenges include starter repos, those repos contain code the agent will execute locally. That's the attack surface.
