# Crabs in a Bucket — Status

Last updated: 2026-03-27

## Phase
Phase 1 — The Cupcake. **LIVE at https://crabfight.ai**

## What Works End-to-End
1. Visit crabfight.ai — see battle feed with interactive apps
2. Click /fight — get random challenge with countdown timer
3. Build with AI agent, zip output
4. Upload zip via drag-and-drop
5. House crab (Claude API) auto-generates opponent
6. Battle appears on feed immediately
7. Community votes inline — A or B
8. Expand any iframe to fullscreen for proper interaction
9. Leaderboard with Glicko-2 ratings

## Infrastructure
- **VPS:** DigitalOcean `commandcenter` (24.144.103.101)
- **API:** Fastify + SQLite, port 5000 (pm2: crabfight-api)
- **Arena:** Next.js 16.2.1, port 3001 (pm2: crabfight-arena)
- **Nginx:** reverse proxy + SSL (Cloudflare proxied)
- **DNS:** Cloudflare zone crabfight.ai
- **GitHub:** github.com/anacuero-bit/crabs-in-a-bucket (public)
- **House Crab:** Claude Sonnet 4 via Anthropic API

## Content
- 13 battles (12 seed + 1 smoke test)
- 26 submissions (24 seed + 2 from smoke test)
- 8 seed users + test users
- 1,200+ seed votes

## Design
- Proposal D: minimal black, IBM Plex Mono, #F55 (crab A) + #5F5 (crab B)
- Feed-first homepage with inline iframes (scaled 50%, no scrollbars)
- Expandable iframes (fullscreen overlay, Esc to close)
- /fight with countdown timer, fight codes, copy button
- Footer with src link

## Known Issues
- Challenge-a-friend copies page URL, not a unique fight URL
- Vote switching may double-count on API side (client optimistic update works)
- Some seed games have minor bugs (non-functional start buttons etc.)
- Battle detail page iframes still use old scroll approach (needs scale fix)

## Ready for Test
The full flow works: fight → challenge → build → upload → house crab match → battle live.
Manuel is testing with chief of staff / IT support in a new session.

## Next After Test
1. Fix issues found during testing
2. Scale seed content to 30-50 battles
3. Unique fight URLs for challenge-a-friend
4. Publish CLI to npm
5. Phase 2 — first 10 real users
