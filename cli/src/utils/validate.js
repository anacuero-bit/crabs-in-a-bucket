import fs from 'fs';
import path from 'path';

export function validateSubmission(dir) {
  const errors = [];

  const indexPath = path.join(dir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    errors.push('Missing required file: index.html');
  }

  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
    errors.push('Missing required directory: src/');
  } else {
    const srcFiles = fs.readdirSync(srcDir);
    if (srcFiles.length === 0) {
      errors.push('src/ directory must contain at least one file');
    }
  }

  const metaPath = path.join(dir, '.crabs-meta.json');
  if (!fs.existsSync(metaPath)) {
    errors.push('Missing .crabs-meta.json — was this folder created with `crabs pull`?');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
