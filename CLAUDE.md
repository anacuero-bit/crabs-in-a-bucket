# Crabs in a Bucket

**Project:** Competitive AI harness battle game
**Entity:** Yellow Bloom AI
**Status:** Brainstorm / scaffolding
**Role:** Solo (CEO/CTO combined until scope clarifies)

## Concept

A competitive game/platform where players' AI architectures (their Claude Code setup, CLAUDE.md, skills, MCP servers, hooks, memory systems — their entire "harness") are converted into battling avatars that fight each other in simulated war games.

## How It Works

### 1. The Prompt (standardized intake)
Every competitor gets the same prompt. They run it through their Claude Code / Codex / whatever harness they use. The prompt forces a standardized markdown output that maps their entire architecture:
- File structure / organization
- Number and quality of skills
- Memory systems (type, depth, persistence)
- MCP servers and integrations
- Hooks and automation
- Agent architecture (single, multi-agent, teams)
- Custom tools and scripts
- Context management strategy

### 2. The Engine (avatar builder)
Our platform ingests that standardized MD and generates an avatar. The avatar's attributes (strength, speed, intelligence, defense, special abilities, army size, etc.) are derived from the architecture components. Examples:
- More skills → larger army or more weapons
- Better memory system → higher intelligence stat
- More MCP integrations → more alliances/resources
- Hooks/automation → faster reaction time
- Multi-agent architecture → squad/team composition

The avatar could take many forms: superhero, army general, startup CEO, mech pilot, fantasy warrior — the theme is flexible.

### 3. The Battle (simulation)
Two avatars are matched. The platform simulates a multi-stage battle/competition:
- Stages unfold based on component matchups
- Each stage narrates what happens (e.g., "Player A's memory system outflanks Player B's — intelligence advantage triggers a strategic maneuver")
- The simulation plays out until one wins
- Results are narrated, visual, engaging

### 4. The Platform (competition)
- Ladder/ranking system
- Challenge anyone on the leaderboard
- Seasons or tournaments
- Spectator mode — watch battles play out
- Public profiles showing avatar + architecture stats

## Research Brief (for first session)

On first session, the agent should do live research on:

1. **Comparable products** — is anyone doing competitive AI harness benchmarking, gamified? PvP for dev tools? Any "battle" metaphor applied to developer configurations?

2. **Avatar generation from structured data** — state of the art for turning a data profile into a visual character/entity. AI image generation, procedural character creation, attribute-to-visual pipelines.

3. **Battle simulation engines** — turn-based or real-time simulation from attribute sets. Existing game engines, narrative battle generators, auto-battler mechanics.

4. **Standardized architecture scanning** — how to build a prompt that reliably extracts a full harness architecture from any setup (Claude Code, Cursor, Codex, Windsurf, etc.). What's extractable, what's not.

5. **Competitive gaming UX** — ladder systems, ELO ratings, matchmaking, season mechanics. What makes competitive games sticky.

6. **Tech stack options** — web framework, real-time multiplayer, database for rankings, hosting.

## Key Design Questions

- What theme/aesthetic? (military, superhero, fantasy, corporate, sci-fi)
- Real-time visual battles or text-based narrative simulation?
- How to prevent gaming the prompt (people inflating their architecture)?
- How to make non-technical spectators enjoy watching?
- Monetization angle or purely community/fun?
- MVP scope — what's the absolute minimum to test the concept?

## Before Closing Any Session

Update `status.md` with: research findings, decisions made, components built, open questions.
