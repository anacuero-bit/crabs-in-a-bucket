import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { createInterface } from 'readline';
import { validateSubmission } from '../utils/validate.js';
import { zipDirectory } from '../utils/zip.js';
import { apiPostZip } from '../utils/api.js';
import { getElapsedSeconds, formatTime } from '../utils/timer.js';

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function submitCommand(inputPath) {
  const dir = path.resolve(inputPath || process.cwd());

  console.log(chalk.gray(`  Submitting from: ${dir}`));
  console.log('');

  // Validate
  const validation = validateSubmission(dir);
  if (!validation.valid) {
    console.log(chalk.red.bold('  ✗ Validation failed:'));
    for (const err of validation.errors) {
      console.log(chalk.red(`    • ${err}`));
    }
    console.log('');
    process.exit(1);
  }

  console.log(chalk.green('  ✓ Folder structure valid'));

  // Read meta
  const metaPath = path.join(dir, '.crabs-meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

  // Check timer
  const elapsed = getElapsedSeconds(meta.start_time);
  const timeLimit = meta.time_limit;

  console.log(chalk.gray(`  Time elapsed: ${formatTime(elapsed)}`));

  if (elapsed > timeLimit) {
    const over = elapsed - timeLimit;
    console.log(chalk.yellow.bold(`  ⚠  Over time limit by ${formatTime(over)}! Submitting anyway...`));
  } else {
    const remaining = timeLimit - elapsed;
    console.log(chalk.green(`  ✓ Within time limit (${formatTime(remaining)} remaining)`));
  }
  console.log('');

  // Get model info
  let model = process.env.CRABS_MODEL;
  if (!model) {
    model = await prompt(chalk.cyan('  Which AI model did you use? '));
  }

  // Get harness info
  let harness = process.env.CRABS_HARNESS;
  if (!harness) {
    harness = await prompt(chalk.cyan('  Which harness/tool did you use? '));
  }

  // Generate crabs.json
  const crabsJson = {
    challenge_id: meta.challenge_id,
    time_elapsed: elapsed,
    submitted_at: new Date().toISOString(),
    model: model || 'unknown',
    harness: harness || 'unknown',
  };
  fs.writeFileSync(path.join(dir, 'crabs.json'), JSON.stringify(crabsJson, null, 2), 'utf-8');
  console.log(chalk.green('  ✓ Generated crabs.json'));

  // Zip
  const spinner = ora('Zipping submission...').start();
  let zipBuffer;
  try {
    zipBuffer = await zipDirectory(dir);
    spinner.succeed(`Zipped (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    spinner.fail('Failed to zip');
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }

  // Upload
  const uploadSpinner = ora('Uploading to battle arena...').start();
  try {
    const filename = `crabs-${meta.challenge_id}.zip`;
    const result = await apiPostZip('/submissions', zipBuffer, filename);
    uploadSpinner.succeed('Submission uploaded!');

    console.log('');
    console.log(chalk.bold.green('  ╔══════════════════════════════════════╗'));
    console.log(chalk.bold.green('  ║') + chalk.bold.white('  SUBMISSION CONFIRMED!') + chalk.bold.green('               ║'));
    console.log(chalk.bold.green('  ╚══════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.gray('  Submission ID: ') + chalk.cyan.bold(result.id || result.submission_id || 'N/A'));
    console.log(chalk.gray('  Challenge:     ') + chalk.white(meta.challenge_name));
    console.log(chalk.gray('  Model:         ') + chalk.yellow(model));
    console.log(chalk.gray('  Harness:       ') + chalk.yellow(harness));
    console.log(chalk.gray('  Time:          ') + chalk.white(formatTime(elapsed)));
    console.log('');
    console.log(chalk.cyan('  Run ') + chalk.white('crabs status <id>') + chalk.cyan(' to check your results!'));
    console.log('');
  } catch (err) {
    uploadSpinner.fail('Upload failed');
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }
}
