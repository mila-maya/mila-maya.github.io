#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, 'content', 'thesis-template');
const templateFilesDir = path.join(repoRoot, 'public', 'template-files');
const downloadsDir = path.join(repoRoot, 'public', 'downloads');
const zipOutput = path.join(downloadsDir, 'thesis-template.zip');
const thesisPdfSource = path.join(sourceDir, 'thesis.pdf');
const slidesPdfSource = path.join(sourceDir, 'presentation', 'presentation.pdf');
const thesisPdfOutput = path.join(downloadsDir, 'thesis-template.pdf');
const slidesPdfOutput = path.join(downloadsDir, 'thesis-template-presentation.pdf');
const skipPdfs = process.argv.includes('--skip-pdfs');

const ignoredDirs = new Set(['.git', '.idea', '.vscode', 'node_modules']);
const ignoredNames = new Set(['.DS_Store']);
const ignoredSuffixes = [
  '.aux',
  '.bbl',
  '.blg',
  '.fdb_latexmk',
  '.fls',
  '.log',
  '.lof',
  '.lot',
  '.out',
  '.synctex.gz',
  '.toc',
  '.xmpdata',
  '.nav',
  '.snm',
  '.swp',
  '.swo',
  '.Zone.Identifier'
];

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function shouldIgnore(relPath, isDirectory) {
  const relPosix = toPosix(relPath);
  const basename = path.basename(relPath);

  if (ignoredNames.has(basename)) {
    return true;
  }

  if (isDirectory) {
    return ignoredDirs.has(basename);
  }

  if (basename.endsWith('.pdf') && basename !== 'cover_thesis_template.pdf') {
    return true;
  }

  return ignoredSuffixes.some((suffix) => relPosix.endsWith(suffix));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyFilteredTree(source, destination, root) {
  await ensureDir(destination);
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const relPath = path.relative(root, sourcePath);

    if (shouldIgnore(relPath, entry.isDirectory())) {
      continue;
    }

    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyFilteredTree(sourcePath, destinationPath, root);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    await ensureDir(path.dirname(destinationPath));
    await fs.copyFile(sourcePath, destinationPath);
  }
}

function runCommand(binary, args, options = {}) {
  execFileSync(binary, args, {
    stdio: 'pipe',
    ...options
  });
}

function createZipFromFolder(parentDir, folderName, outputPath) {
  try {
    runCommand('tar', ['-a', '-cf', outputPath, '-C', parentDir, folderName]);
    return;
  } catch {}

  if (process.platform === 'win32') {
    const folderPath = path.join(parentDir, folderName).replace(/'/g, "''");
    const zipPath = outputPath.replace(/'/g, "''");
    const command = `Compress-Archive -Path '${folderPath}' -DestinationPath '${zipPath}' -Force`;
    try {
      runCommand('powershell', ['-NoProfile', '-NonInteractive', '-Command', command]);
      return;
    } catch {}
  } else {
    try {
      runCommand('zip', ['-r', outputPath, folderName], { cwd: parentDir });
      return;
    } catch {}
  }

  throw new Error('Failed to create thesis-template.zip. Install tar, zip, or use PowerShell Compress-Archive.');
}

async function copyPdfOrHandleMissing(source, output, label) {
  if (existsSync(source)) {
    await fs.copyFile(source, output);
    return;
  }

  if (skipPdfs) {
    console.warn(`[sync-thesis-template] ${label} not found at ${source}. Keeping existing file in public/downloads if present.`);
    return;
  }

  throw new Error(
    `${label} not found at ${source}. Build PDFs first (e.g. run make in content/thesis-template), or rerun with --skip-pdfs.`
  );
}

async function main() {
  if (!existsSync(sourceDir)) {
    throw new Error(`Source directory missing: ${sourceDir}`);
  }

  await fs.rm(templateFilesDir, { recursive: true, force: true });
  await ensureDir(templateFilesDir);
  await ensureDir(downloadsDir);

  await copyFilteredTree(sourceDir, templateFilesDir, sourceDir);

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'thesis-template-sync-'));
  const zipFolderName = 'thesis-template';
  const zipSourceDir = path.join(tempRoot, zipFolderName);

  try {
    await copyFilteredTree(sourceDir, zipSourceDir, sourceDir);
    await fs.rm(zipOutput, { force: true });
    createZipFromFolder(tempRoot, zipFolderName, zipOutput);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }

  await copyPdfOrHandleMissing(thesisPdfSource, thesisPdfOutput, 'thesis.pdf');
  await copyPdfOrHandleMissing(slidesPdfSource, slidesPdfOutput, 'presentation.pdf');

  console.log('[sync-thesis-template] Sync complete: public/template-files and public/downloads updated.');
}

main().catch((error) => {
  console.error(`[sync-thesis-template] ${error.message}`);
  process.exitCode = 1;
});
