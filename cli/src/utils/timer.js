import chalk from 'chalk';

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function startCountdown(timeLimitSeconds) {
  let remaining = timeLimitSeconds;

  const interval = setInterval(() => {
    remaining--;
    const display = formatTime(remaining);

    if (remaining <= 0) {
      clearInterval(interval);
      console.log(chalk.red.bold(`\n  TIME'S UP! You can still submit, but you're over the limit.`));
      return;
    }

    if (remaining <= 60) {
      process.stdout.write(chalk.red(`\r  ⏱  Time remaining: ${display}  `));
    } else if (remaining <= 300) {
      process.stdout.write(chalk.yellow(`\r  ⏱  Time remaining: ${display}  `));
    } else {
      process.stdout.write(chalk.green(`\r  ⏱  Time remaining: ${display}  `));
    }
  }, 1000);

  // Don't keep the process alive just for the timer
  interval.unref();
  return interval;
}

export function getElapsedSeconds(startTimeISO) {
  const start = new Date(startTimeISO).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 1000);
}
