import { getApiUrl, loadConfig } from '../config.js';

function getAuthHeaders() {
  const config = loadConfig();
  if (config.api_key) {
    return { 'Authorization': `Bearer ${config.api_key}` };
  }
  return {};
}

export async function apiGet(urlPath) {
  const url = `${getApiUrl()}${urlPath}`;
  const res = await fetch(url, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${res.statusText}${body ? ' - ' + body : ''}`);
  }
  return res.json();
}

export async function apiPost(urlPath, body) {
  const url = `${getApiUrl()}${urlPath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${res.statusText}${text ? ' - ' + text : ''}`);
  }
  return res.json();
}

export async function apiPostZip(urlPath, zipBuffer, filename) {
  const url = `${getApiUrl()}${urlPath}`;

  const boundary = '----CrabsFormBoundary' + Date.now().toString(36);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/zip\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const headerBuf = Buffer.from(header, 'utf-8');
  const footerBuf = Buffer.from(footer, 'utf-8');
  const body = Buffer.concat([headerBuf, zipBuffer, footerBuf]);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      ...getAuthHeaders(),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${res.statusText}${text ? ' - ' + text : ''}`);
  }
  return res.json();
}
