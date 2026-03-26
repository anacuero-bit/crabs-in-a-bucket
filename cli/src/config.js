import fs from 'fs';
import path from 'path';
import os from 'os';

export const VERSION = '0.1.0';

const CONFIG_DIR = path.join(os.homedir(), '.crabs');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getApiUrl() {
  return process.env.CRABS_API_URL || loadConfig().api_url || 'https://api.crabfight.ai/api';
}

export function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

export function saveConfig(data) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const existing = loadConfig();
  const merged = { ...existing, ...data };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

// Backward compat
export const API_BASE_URL = getApiUrl();
