#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, '.env.local');
const outputFile = path.join(repoRoot, 'src', 'data', 'books.json');

async function loadEnv() {
  try {
    const content = await fs.readFile(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local not required if env already set (e.g. in CI)
  }
}

function plainText(richText) {
  if (!Array.isArray(richText)) return '';
  return richText.map((r) => r.plain_text ?? '').join('');
}

function parseTakeaways(text) {
  if (!text) return [];
  return text
    .split(/\r?\n+/)
    .map((l) => l.replace(/^\s*[-*•\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function queryDatabase(token, dbId) {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: '⭐', checkbox: { equals: true } },
        page_size: 100,
        start_cursor: cursor,
      }),
    });
    if (!res.ok) {
      throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function fetchOpenLibraryCover(title, author) {
  const q = new URLSearchParams({ title, author: author ?? '', limit: '1' });
  const res = await fetch(`https://openlibrary.org/search.json?${q}`);
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data.docs?.[0];
  if (!doc?.cover_i) return null;
  return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
}

function extractProps(page) {
  const p = page.properties;
  const title = plainText(p.Name?.title).trim();
  const authors = (p.Author?.multi_select ?? []).map((a) => a.name);
  const categories = (p.Category?.multi_select ?? []).map((c) => c.name);
  const rating = (p.Rating?.multi_select ?? []).map((r) => r.name);
  const finished = p.Finished?.date?.start ?? null;
  const url = p.URL?.url ?? null;
  const takeawaysText = plainText(p.Takeaways?.rich_text);
  return {
    id: page.id,
    slug: slugify(title || page.id),
    title,
    authors,
    categories,
    rating,
    finished,
    url,
    notionUrl: page.url,
    takeaways: parseTakeaways(takeawaysText),
  };
}

async function main() {
  await loadEnv();
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_BOOKS_DB_ID;
  if (!token || !dbId) {
    console.warn('[sync-books] NOTION_TOKEN or NOTION_BOOKS_DB_ID missing — skipping sync.');
    try {
      await fs.access(outputFile);
      console.warn('[sync-books] Keeping existing books.json.');
    } catch {
      await fs.mkdir(path.dirname(outputFile), { recursive: true });
      await fs.writeFile(outputFile, JSON.stringify([], null, 2) + '\n');
      console.warn('[sync-books] Wrote empty books.json placeholder.');
    }
    return;
  }

  console.log('[sync-books] Fetching starred books from Notion…');
  const pages = await queryDatabase(token, dbId);
  console.log(`[sync-books] Found ${pages.length} starred book(s).`);

  const books = [];
  for (const page of pages) {
    const book = extractProps(page);
    if (!book.title) continue;
    const cover = await fetchOpenLibraryCover(book.title, book.authors[0]);
    books.push({ ...book, cover });
    console.log(`[sync-books]  • ${book.title}${cover ? ' (cover found)' : ''}`);
  }

  books.sort((a, b) => a.title.localeCompare(b.title));

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(books, null, 2) + '\n');
  console.log(`[sync-books] Wrote ${books.length} book(s) to ${path.relative(repoRoot, outputFile)}`);
}

main().catch((err) => {
  console.error('[sync-books] Error:', err.message);
  process.exit(1);
});
