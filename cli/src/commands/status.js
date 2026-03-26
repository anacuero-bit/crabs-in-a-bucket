import chalk from 'chalk';
import ora from 'ora';
import { apiGet } from '../utils/api.js';

export async function statusCommand(submissionId) {
  if (!submissionId) {
    console.log(chalk.red('  Please provide a submission ID'));
    process.exit(1);
  }

  const spinner = ora('Fetching submission status...').start();

  try {
    const data = await apiGet(`/submissions/${submissionId}`);
    spinner.succeed('Status retrieved!');

    const score = data.score ?? data.referee_score ?? 'Pending';
    const votes = data.votes ?? data.vote_count ?? 0;
    const battleLink = data.battle_link ?? data.battle_url ?? 'N/A';
    const status = data.status || 'unknown';

    console.log('');
    console.log(chalk.bold.cyan('  ╔══════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('  ║') + chalk.bold.white('  SUBMISSION STATUS') + chalk.bold.cyan('                   ║'));
    console.log(chalk.bold.cyan('  ╚══════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.gray('  Submission ID:  ') + chalk.white(submissionId));
    console.log(chalk.gray('  Status:         ') + chalk.yellow(status));
    console.log(chalk.gray('  Referee Score:  ') + chalk.green.bold(String(score)));
    console.log(chalk.gray('  Vote Count:     ') + chalk.magenta(String(votes)));
    console.log(chalk.gray('  Battle Link:    ') + chalk.cyan.underline(String(battleLink)));
    console.log('');
  } catch (err) {
    spinner.fail('Failed to fetch status');
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }
}
