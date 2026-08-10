import { access, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const VERSION = process.env.UNICODE_VERSION ?? '17.0.0';
const root = resolve(process.cwd(), 'data', 'ucd', VERSION);
const rawRoot = join(root, 'raw');
const zipPath = join(root, 'UCD.zip');
const url = `https://www.unicode.org/Public/${VERSION}/ucd/UCD.zip`;

await mkdir(rawRoot, { recursive: true });

try {
  await access(zipPath);
  console.log(`Using cached ${zipPath}`);
} catch {
  console.log(`Downloading Unicode UCD ${VERSION}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download ${url}: ${response.status}`);
  await writeFile(zipPath, Buffer.from(await response.arrayBuffer()));
}

await execFileAsync('unzip', ['-o', zipPath, '-d', rawRoot], { maxBuffer: 1024 * 1024 });
console.log(`Unicode UCD ${VERSION} is ready at ${rawRoot}`);
