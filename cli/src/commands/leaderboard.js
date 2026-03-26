import chalk from 'chalk';
import ora from 'ora';
import { apiGet } from '../utils/api.js';

export async function leaderboardCommand() {
  const spinner = ora('Fetching leaderboard...').start();

  try {
    const data = await apiGet('/leaderboard');
    spinner.succeed('Leaderboard loaded!');

    const players = Array.isArray(data) ? data : data.players || data.leaderboard || [];
    const top = players.slice(0, 20);

    console.log('');
    console.log(chalk.bold.yellow('  ╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.yellow('  ║') + chalk.bold.white('  LEADERBOARD — TOP 20') + chalk.bold.yellow('                                         ║'));
    console.log(chalk.bold.yellow('  ╚═══════════════════════════════════════════════════════════════╝'));
    console.log('');

    // Table header
    const hRank = '#'.padStart(3);
    const hName = 'Player'.padEnd(20);
    const hRating = 'Rating'.padStart(7);
    const hTier = 'Tier'.padEnd(12);
    const hWins = 'W'.padStart(4);
    const hLosses = 'L'.padStart(4);

    console.log(chalk.gray(`  ${hRank}  ${hName}  ${hRating}  ${hTier}  ${hWins}  ${hLosses}`));
    console.log(chalk.gray('  ' + '─'.repeat(60)));

    if (top.length === 0) {
      console.log(chalk.gray('  No players yet. Be the first!'));
    }

    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const rank = String(i + 1).padStart(3);
      const name = (p.name || p.username || p.player || 'Unknown').padEnd(20);
      const rating = String(p.rating || p.elo || 0).padStart(7);
      const tier = (p.tier || '—').padEnd(12);
      const wins = String(p.wins || 0).padStart(4);
      const losses = String(p.losses || 0).padStart(4);

      let rankColor = chalk.white;
      if (i === 0) rankColor = chalk.yellow.bold;
      else if (i === 1) rankColor = chalk.gray.bold;
      else if (i === 2) rankColor = chalk.hex('#CD7F32').bold; // bronze

      console.log(`  ${rankColor(rank)}  ${chalk.white(name)}  ${chalk.cyan(rating)}  ${chalk.magenta(tier)}  ${chalk.green(wins)}  ${chalk.red(losses)}`);
    }

    console.log('');
  } catch (err) {
    spinner.fail('Failed to fetch leaderboard');
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }
}
