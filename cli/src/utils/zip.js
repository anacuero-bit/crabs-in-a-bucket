import archiver from 'archiver';
import { PassThrough } from 'stream';

export async function zipDirectory(dirPath) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', reject);
    archive.pipe(passthrough);
    archive.directory(dirPath, false);
    archive.finalize();
  });
}
