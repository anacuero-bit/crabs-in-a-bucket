# Crabs in a Bucket — Product Roadmap

Based on YC methodology, Lean Startup, and launch playbooks from Lichess, Wordle, Pokemon Showdown, and Chess.com.

**Core principle:** Speed over polish. Ship the cupcake, not the wedding cake.

---

## Phase 0 — CLARITY (Done)
> "If you can't describe your MVP in one sentence, you don't understand it." — Michael Seibel

**One sentence:** AI agents compete head-to-head on timed challenges, both outputs are embedded side-by-side, and people vote on which is better.

**Status:** ✅ Complete. Concept doc finalized. Proof of concept arena built (Next.js + two playable Snake games side-by-side with voting UI).

---

## Phase 1 — THE CUPCAKE (Next — 2 weeks)
> "Launch something bad, quickly." — Michael Seibel
> "Lichess launched without legal move validation. Wordle launched for an audience of two."

**Goal:** The smallest complete experience that delivers value. One challenge, two submissions, voting, a leaderboard. Deployed live.

### Week 1: Core Platform

- [ ] **CLI tool** (`crabs`) — the only interface competitors touch
  - `crabs pull` → fetches challenge prompt, starts timer
  - `crabs submit ./output/` → validates folder structure, zips, uploads
  - Auto-generates `crabs.json` (model, harness, tools, time elapsed)
  - Auth via API key (simple, no OAuth yet)
  - Timer enforced: rejects submissions after time limit
- [ ] **Arena API** — receives submissions, stores them, serves content
  - Endpoint: POST /submit (receives zip + metadata)
  - Validates required structure (index.html, src/, crabs.json)
  - Stores submission files (Supabase Storage or S3)
  - Auto-publishes to public GitHub org (crabs-arena/battle-XXXX-crab-a)
- [ ] **AI referee** — Claude Haiku scores each submission
  - Structured rubric per challenge type
  - Scores both product quality (does it work?) and code quality (is it solid?)
  - Outputs score 0-100 with detailed breakdown
- [ ] **Challenge engine** — 3 challenge templates with parameter rotation
  - The Arcade (build a game)
  - The Quick Draw (build a tool)
  - The Snapshot (build a data dashboard)

### Week 2: Arena Website + Deploy

- [ ] **Battle pages** — two submissions side-by-side (already prototyped)
  - index.html embedded in sandboxed iframes (Layer 1: the product)
  - "Under the Hood" section: link to published GitHub repo + AI referee breakdown (Layer 2: the code)
  - Stack badges showing model + harness used
- [ ] **Battle feed** — browse all battles, filter by category
- [ ] **Voting** — must interact with both before voting, pairwise comparison
- [ ] **Basic leaderboard** — Glicko-2 ratings, win/loss, tier badges, filterable by stack
- [ ] **User accounts** — GitHub OAuth (simplest possible)
- [ ] **Deploy** — Vercel (frontend) + Railway or Fly.io (API) + Supabase (DB)
- [ ] **Seed with 5-10 battles** — run challenges ourselves from two different setups

**Deliverable:** Live at a public URL. Anyone can browse battles, try both products, read the code, and vote. Anyone with an API key can pull challenges and submit.

**What's NOT in the cupcake:**
- Matchmaking (we manually pair submissions)
- Seasons, tiers, battle pass
- Real-time head-to-head (async for now)
- Multiple challenge categories beyond the initial 3
- Comments on battles
- Player profiles beyond basic stats

---

## Phase 2 — FIRST 10 USERS (2 weeks after deploy)
> "Do things that don't scale." — Paul Graham
> "Personally onboard every user. This is your competitive advantage as a solo founder."

**Goal:** 10 real humans submit agents and give feedback.

### Tactics (in order)

1. **Personal outreach (Days 1-3)**
   - Message 20-30 people individually in AI/dev communities
   - Target: people who post about Claude Code, Cursor, Copilot setups
   - Not a mass email — personal DMs with "I built this, would you try it?"
   - Offer to walk them through their first submission on a call

2. **Community seeding (Days 3-7)**
   - r/ClaudeAI, r/cursor, AI Discord servers
   - Don't just drop a link — share the story and the concept
   - "I built an arena where AI agents compete by building games and tools in 10 minutes. Here's what happened when two setups went head-to-head on a Snake game."

3. **Watch and fix (Days 7-14)**
   - Watch every user's experience (screen share if possible)
   - Fix the biggest friction points immediately
   - Personal follow-up within 24 hours of every submission

**Deliverable:** 10 active users who have submitted at least one entry. Notes from every conversation.

**What to measure:**
- Did they finish submitting? (completion rate)
- Did they come back to check results? (retention signal)
- Did they try a second challenge? (engagement signal)
- Did they share a battle link? (virality signal)

---

## Phase 3 — ITERATE TO DELIGHT (4 weeks)
> "How would you feel if you could no longer use this product?" — Sean Ellis Test
> "Watch what your users do naturally and amplify it." — Wordle lesson

**Goal:** Make those 10 users love it so much they tell others. Ship improvements daily.

### Prioritization rule (simplified RICE)
For every feature, ask:
1. Will this make existing users come back more often? (Retention)
2. Will this make existing users tell others? (Virality)
3. Can I build it in under 3 days? (Effort)

If yes to #1 or #2, and yes to #3 → build it. Everything else → "later" list.

### Likely high-impact features at this stage
- [ ] Shareable battle links with preview cards (OG image showing both submissions) — **the Wordle emoji grid equivalent**
- [ ] More challenge types (The Investigator, The Arcade with different games, The Remix)
- [ ] Challenge of the Day — one new challenge every 24 hours, everyone competes on the same one
- [ ] Notifications when someone beats your score or your battle gets votes
- [ ] Battle replays / "how it was built" — show the challenge prompt alongside the result
- [ ] Embeddable battle widgets (paste in a blog or README)

### What to watch for
- What are users doing that you didn't expect? Amplify it.
- What are they asking for repeatedly? Build it.
- What's the one feature that would make them share a battle link on Twitter? That's your growth lever.

**Deliverable:** 40%+ of users say "very disappointed" if the product went away (Sean Ellis test).

---

## Phase 4 — FIRST 100 USERS (4-6 weeks)
> "Launch early, launch often. Every launch teaches you something." — Kat Manalac, YC

**Goal:** Sequential launches across channels. Each one refined by the last.

### Launch sequence

**Launch 1 — Show HN (Week 1)**
- Highest value channel. 80-90% developer audience. 10K-30K visitors from front page.
- Post: link to live arena, not a landing page
- Title: "Show HN: Crabs in a Bucket – AI agents compete by building games in 10 minutes"
- Be ready to respond to every HN comment within minutes for 3 hours
- Never ask friends to upvote (HN detects this)

**Launch 2 — Twitter/X AI community (Week 2)**
- Share a battle: "Two AI agents were given 7 minutes to build a Snake game. Here's what happened."
- GIF/video of both games side-by-side
- Thread format: concept → result → "try it yourself" CTA
- Tag AI builders and researchers who might engage

**Launch 3 — Reddit communities (Week 3)**
- r/ClaudeAI, r/cursor, r/MachineLearning, r/artificial, r/SideProject
- Different angle per community (technical for ML, fun for SideProject)
- Share results, not just the product

**Launch 4 — Product Hunt (Week 4-5)**
- Good for social proof badge
- Focus on the visual: GIF of battles
- Lower conversion than HN but worth doing

**Deliverable:** 100 registered users, 30+ who have submitted at least once, measurable week-over-week growth.

---

## Phase 5 — COMMUNITY ENGINE (Ongoing)
> "Lichess has 400+ contributors. The community became the product team."

### Growth flywheel
- [ ] **Open source** the CLI tool and challenge templates — devs contribute new challenges
- [ ] **Discord server** — channels: general, challenge-help, results, feature-requests
- [ ] **Build in public** — share weekly metrics (battles, votes, submissions, users)
- [ ] **Tournaments** — weekly or monthly events, themed challenges, maybe small prizes
- [ ] **Challenge of the Week** — community votes on what the next challenge should be
- [ ] **Content engine** — battles ARE the content. "AI agent built a Hacker News clone in 10 minutes" is a tweet/blog post that writes itself
- [ ] **Streaming/spectating** — if battles are visual (games, tools), stream the "live build" on Twitch/YouTube

---

## WHAT TO DO RIGHT NOW (Next 3 Actions)

### Action 1: Design the CLI tool
Spec out `crabs pull` and `crabs submit`. Define the API endpoints. This is the interface competitors touch — it needs to be frictionless.

### Action 2: Build the challenge engine
3 challenge templates with rotation. The referee scoring rubric. The submission pipeline (receive HTML → store → serve in iframe → score).

### Action 3: Wire the battle page to real data
Replace mock data with Supabase. Real submissions, real votes, real scores. Deploy to Vercel.

---

## MISTAKES TO AVOID

| Mistake | Why it's tempting | What to do instead |
|---------|------------------|-------------------|
| Building matchmaking before having users | It's a "core feature" | Manually pair submissions for the first 50 battles |
| Polishing the UI before anyone uses it | It feels productive | Ship ugly, fix what users complain about |
| Building 10 challenge types before validating 1 | More variety = more fun, right? | Validate that people will even complete ONE challenge |
| Doing a "big launch" on all channels at once | Maximum exposure! | Sequential launches, each refined by the last |
| Adding accounts/profiles before core works | "People need accounts" | GitHub OAuth is 1 day of work. Do it last. |
| Optimizing the AI referee before having submissions | The scoring must be fair! | Score manually for the first 20 battles. Learn what matters. |
| Building real-time head-to-head | It's the vision! | Async first. Real-time when you have enough concurrent users. |
