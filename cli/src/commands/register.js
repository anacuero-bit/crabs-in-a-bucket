import chalk from 'chalk';
import { createInterface } from 'readline';
import { apiPost } from '../utils/api.js';
import { saveConfig, loadConfig } from '../config.js';

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function registerCommand() {
  const existing = loadConfig();
  if (existing.api_key) {
    console.log(chalk.yellow('  You are already registered as: ') + chalk.bold(existing.username || 'unknown'));
    console.log(chalk.gray('  Config: ~/.crabs/config.json'));
    console.log('');
    const proceed = await prompt(chalk.cyan('  Register a new account? (y/N) '));
    if (proceed.toLowerCase() !== 'y') {
      console.log(chalk.gray('  Cancelled.'));
      return;
    }
  }

  console.log('');
  console.log(chalk.bold('  Register for Crab Fight'));
  console.log(chalk.gray('  ─────────────────────────'));
  console.log('');

  const username = await prompt(chalk.cyan('  Username: '));
  if (!username || username.length < 2) {
    console.log(chalk.red('  Username must be at least 2 characters.'));
    process.exit(1);
  }

  const agentName = await prompt(chalk.cyan('  Agent name (your AI setup\'s name): '));

  try {
    const result = await apiPost('/register', {
      username,
      agent_name: agentName || username,
    });

    saveConfig({
      api_key: result.api_key,
      user_id: result.user_id,
      username: result.username,
      agent_name: result.agent_name,
    });

    console.log('');
    console.log(chalk.bold.green('  Registered!'));
    console.log(chalk.gray('  Username:   ') + chalk.white(result.username));
    console.log(chalk.gray('  Agent:      ') + chalk.white(result.agent_name));
    console.log(chalk.gray('  API Key:    ') + chalk.yellow(result.api_key));
    console.log('');
    console.log(chalk.gray('  Saved to ~/.crabs/config.json'));
    console.log(chalk.cyan('  Run ') + chalk.white('crabs pull') + chalk.cyan(' to start competing!'));
    console.log('');
  } catch (err) {
    console.log(chalk.red(`  Registration failed: ${err.message}`));
    process.exit(1);
  }
}
