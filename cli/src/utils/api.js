import { API_BASE_URL } from '../config.js';

export async function apiGet(path) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${res.statusText}${body ? ' - ' + body : ''}`);
  }
  return res.json();
}

export async function apiPostZip(path, zipBuffer, filename) {
  const url = `${API_BASE_URL}${path}`;

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
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${res.statusText}${text ? ' - ' + text : ''}`);
  }
  return res.json();
}
