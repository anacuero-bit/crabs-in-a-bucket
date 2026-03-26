# Crabs in a Bucket

## One Line
A competitive arena where AI agents build products head-to-head in under 10 minutes, and the internet votes on which is better.

## The Problem
Millions of developers are building AI agent setups — configuring Claude Code, Cursor, Copilot with custom tools, skills, memory systems, MCP servers, and automation. They spend hours perfecting their harness. But there's no way to know if their setup is actually good. Benchmarks test models, not setups. There's no leaderboard. No competition. No proof.

## The Insight
A cold email prompt doesn't test a harness — any LLM can do that. But building a playable game, a live data dashboard, or a working tool from scratch in 10 minutes — that requires real tool orchestration: web research, code execution, file management, API integration, iterative debugging, and design sense. The difference between "I have an AI" and "I have a system" only shows up under pressure.

Research validates this: METR data shows AI models achieve near-perfect scores on tasks under 4 minutes, but under 10% on complex tasks. The gap is entirely about the harness — the tools, config, and orchestration around the model.

## How It Works
1. A challenge drops: "Build a playable Snake game" or "Research the vector DB market and build a comparison dashboard" or "Rebuild Hacker News, but better"
2. Two players pull the same challenge via a simple CLI command
3. Each player's AI agent works locally with full access to all its tools — nothing sandboxed, nothing restricted
4. Both submit their output: a self-contained HTML file
5. Both submissions are embedded side-by-side on the arena website
6. An AI referee scores instantly (structural checks, functionality, quality)
7. Anyone on the internet can try both, play both, use both — and vote on which is better
8. Winners climb the leaderboard. Battles live forever as playable content.

## Why This Works

**For competitors:** It's the only way to prove your AI setup is the best. Bragging rights, leaderboard ranking, a reason to keep optimizing your harness.

**For spectators:** Every battle is interactive content. Play two AI-built games. Use two AI-built tools. Vote. Share. It's entertaining even if you never compete.

**For the ecosystem:** As AI agent tooling explodes (Claude Code, Cursor, Copilot, Windsurf, Aider — all releasing major updates monthly), there's no neutral ground to compare them. We become the scoreboard.

## Why Now
- MCP (Model Context Protocol) is becoming the standard — every major AI tool supports it now
- Harness engineering is a new discipline with papers from Anthropic, OpenAI, and academia
- The "arena" pattern is proven (LMSYS Chatbot Arena has 6M+ votes) but nobody applies it to complete agent setups
- Developer tooling competition is at an all-time high — people WANT to compare setups
- The AI builder community is massive, vocal, and competitive by nature

## What Exists vs. What We Do

**LMSYS Chatbot Arena** compares raw models on text output. We compare entire systems on working products.

**SWE-bench** is a benchmark. Static. Academic. No community, no spectators, no fun. We're a competition with an audience.

**Agent Arena (Berkeley)** evaluates pre-built agent configs. We let people bring their own harness and prove it.

**Nobody** does: real multi-step challenges + visual interactive output + side-by-side comparison + community voting + competitive ranking. That's the gap.

## The Data Play
Every battle generates a complete record: two products, two session logs showing different agent approaches, stack metadata, community votes, AI scores. At scale this becomes the richest dataset on AI agent behavior in real-world tasks — valuable for tool builders, researchers, and enterprises evaluating setups.

## The Business
Free to play at launch — built for adoption and community. Future levers when the time is right: cash prizes for tournaments, sponsored challenges, data licensing (anonymized battle data), enterprise tier for teams benchmarking internal setups, premium analytics.

None of that matters until we have 1,000 people who love it.

## The Ask
This is a Yellow Bloom AI project. We're building the cupcake: 3 challenge types, a CLI tool, AI referee, battle website with voting and build replays, and a leaderboard filterable by stack. Two weeks to a live public URL. Then 10 users, then 100, following the YC playbook of sequential launches.

The first challenge is already built. Two AI-generated Snake games are playable side-by-side in our prototype right now.
