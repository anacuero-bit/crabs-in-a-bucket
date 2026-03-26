import chalk from 'chalk';
import ora from 'ora';
import { apiGet } from '../utils/api.js';
import { formatTime } from '../utils/timer.js';

export async function challengesCommand() {
  const spinner = ora('Fetching challenges...').start();

  try {
    const data = await apiGet('/challenges');
    spinner.succeed('Challenges loaded!');

    const challenges = Array.isArray(data) ? data : data.challenges || [];

    console.log('');
    console.log(chalk.bold.cyan('  ╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('  ║') + chalk.bold.white('  AVAILABLE CHALLENGES') + chalk.bold.cyan('                                         ║'));
    console.log(chalk.bold.cyan('  ╚═══════════════════════════════════════════════════════════════╝'));
    console.log('');

    if (challenges.length === 0) {
      console.log(chalk.gray('  No challenges available right now.'));
      console.log('');
      return;
    }

    // Table header
    const hName = 'Name'.padEnd(28);
    const hTier = 'Tier'.padEnd(10);
    const hCategory = 'Category'.padEnd(14);
    const hTime = 'Time Limit';

    console.log(chalk.gray(`  ${hName}  ${hTier}  ${hCategory}  ${hTime}`));
    console.log(chalk.gray('  ' + '─'.repeat(68)));

    for (const c of challenges) {
      const name = (c.name || c.title || 'Unnamed').padEnd(28);
      const tier = String(c.tier || '—').padEnd(10);
      const category = (c.category || '—').padEnd(14);
      const timeLimit = c.time_minutes ? c.time_minutes * 60 : (c.time_limit || c.timeLimit || 1800);
      const time = formatTime(timeLimit);

      const tierColor = {
        'bronze': chalk.hex('#CD7F32'),
        'silver': chalk.gray,
        'gold': chalk.yellow,
        'platinum': chalk.cyan,
        'diamond': chalk.magentaBright,
      }[tier.trim().toLowerCase()] || chalk.white;

      console.log(`  ${chalk.white(name)}  ${tierColor(tier)}  ${chalk.magenta(category)}  ${chalk.green(time)}`);
    }

    console.log('');
    console.log(chalk.gray(`  ${challenges.length} challenge(s) available`));
    console.log(chalk.cyan('  Run ') + chalk.white('crabs pull') + chalk.cyan(' to grab a random one!'));
    console.log('');
  } catch (err) {
    spinner.fail('Failed to fetch challenges');
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }
}
