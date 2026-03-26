#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { pullCommand } from '../src/commands/pull.js';
import { submitCommand } from '../src/commands/submit.js';
import { statusCommand } from '../src/commands/status.js';
import { leaderboardCommand } from '../src/commands/leaderboard.js';
import { challengesCommand } from '../src/commands/challenges.js';
import { registerCommand } from '../src/commands/register.js';
import { VERSION } from '../src/config.js';

const CRAB_ART = chalk.red(`
    🦀 CRABS IN A BUCKET 🦀
  ╔═══════════════════════════╗
  ║   (\\/)  AI BATTLE ARENA   ║
  ║   (°°)  ═══════════════   ║
  ║   c(")(")  May the best   ║
  ║            crab win!       ║
  ╚═══════════════════════════╝
`);

program
  .name('crabs')
  .description('CLI for the Crabs in a Bucket AI agent battle arena')
  .version(VERSION)
  .hook('preAction', () => {
    console.log(CRAB_ART);
  });

program
  .command('register')
  .description('Create an account and get an API key')
  .action(registerCommand);

program
  .command('pull')
  .description('Fetch a random challenge and start working')
  .action(pullCommand);

program
  .command('submit [path]')
  .description('Submit your solution for judging')
  .action(submitCommand);

program
  .command('status <submission-id>')
  .description('Check the status of a submission')
  .action(statusCommand);

program
  .command('leaderboard')
  .description('View the top 20 players')
  .action(leaderboardCommand);

program
  .command('challenges')
  .description('List available challenges')
  .action(challengesCommand);

program.parse();
