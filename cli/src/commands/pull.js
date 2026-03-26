import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { apiGet } from '../utils/api.js';
import { formatTime, startCountdown } from '../utils/timer.js';

export async function pullCommand() {
  const spinner = ora('Fetching a random challenge...').start();

  try {
    const challenge = await apiGet('/challenges/random');
    spinner.succeed('Challenge received!');

    const id = challenge.id || challenge._id;
    const name = challenge.name || challenge.title || 'Unnamed Challenge';
    const tier = challenge.tier || 'unknown';
    const category = challenge.category || 'general';
    const timeLimit = challenge.time_limit || challenge.timeLimit || 1800; // default 30 min
    const prompt = challenge.prompt || challenge.description || 'No prompt provided.';

    console.log('');
    console.log(chalk.bold.cyan('  ╔══════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('  ║') + chalk.bold.white(`  CHALLENGE: ${name}`) + chalk.bold.cyan(''));
    console.log(chalk.bold.cyan('  ╚══════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.gray('  Tier:       ') + chalk.yellow.bold(tier));
    console.log(chalk.gray('  Category:   ') + chalk.magenta(category));
    console.log(chalk.gray('  Time Limit: ') + chalk.green(formatTime(timeLimit)));
    console.log('');
    console.log(chalk.gray('  ─── PROMPT ───────────────────────────'));
    console.log('');

    // Indent the prompt text
    const lines = prompt.split('\n');
    for (const line of lines) {
      console.log(chalk.white(`  ${line}`));
    }

    console.log('');
    console.log(chalk.gray('  ────────────────────────────────────────'));
    console.log('');

    // Create working directory
    const dirName = `crabs-${id}`;
    const dirPath = path.resolve(process.cwd(), dirName);

    if (fs.existsSync(dirPath)) {
      console.log(chalk.yellow(`  ⚠  Directory ${dirName}/ already exists. Using it.`));
    } else {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write CHALLENGE.md
    const challengeMd = `# ${name}\n\n**Tier:** ${tier}  \n**Category:** ${category}  \n**Time Limit:** ${formatTime(timeLimit)}\n\n---\n\n${prompt}\n`;
    fs.writeFileSync(path.join(dirPath, 'CHALLENGE.md'), challengeMd, 'utf-8');

    // Write .crabs-meta.json
    const meta = {
      challenge_id: id,
      challenge_name: name,
      tier,
      category,
      time_limit: timeLimit,
      start_time: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(dirPath, '.crabs-meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

    // Create src/ directory stub
    const srcDir = path.join(dirPath, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }

    console.log(chalk.green.bold(`  ✓ Created ${dirName}/`));
    console.log(chalk.gray(`    ├── CHALLENGE.md`));
    console.log(chalk.gray(`    ├── .crabs-meta.json`));
    console.log(chalk.gray(`    └── src/`));
    console.log('');
    console.log(chalk.cyan('  Your timer starts NOW. Get coding!'));
    console.log('');

    // Start countdown
    startCountdown(timeLimit);

  } catch (err) {
    spinner.fail('Failed to fetch challenge');
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }
}
