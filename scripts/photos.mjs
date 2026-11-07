#!/usr/bin/env node
// Build web versions of gallery photos.
//
// For every album  content/photography/<slug>/_index.md  with  `source: <trip>`  in its front matter,
// read every JPEG under  ~/Pictures/Exports/<trip>/web/  (sub-folders become chapters) and write:
//   .photos-out/<slug>/<id>-<hash>-<width>.{avif,jpg}   web versions (sRGB, all metadata stripped)
//   data/photos/<slug>.json                            what Hugo needs: sizes, dims, date, color, blur preview
//
// Re-running is cheap: unchanged files (same content hash) are skipped. Photos removed from web/ are
// dropped from the JSON and their files deleted from .photos-out/.
//
// Usage: npm run photos            (PHOTOS_EXPORTS=/other/path to override ~/Pictures/Exports)

import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import exifReader from 'exif-reader';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPORTS = process.env.PHOTOS_EXPORTS || path.join(os.homedir(), 'Pictures', 'Exports');
const CONTENT = path.join(ROOT, 'content', 'photography');
const OUT = path.join(ROOT, '.photos-out');
const DATA = path.join(ROOT, 'data', 'photos');

const WIDTHS = [640, 1280, 2048];
const AVIF = { quality: 60, effort: 4 };
const JPEG = { quality: 82, mozjpeg: true, progressive: true };
const CONCURRENCY = 3;

const exists = (p) => fs.access(p).then(() => true, () => false);

async function frontMatter(file) {
  const text = await fs.readFile(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? YAML.parse(m[1]) ?? {} : {};
}

async function sha(file) {
  const h = crypto.createHash('sha1');
  for await (const chunk of createReadStream(file)) h.update(chunk);
  return h.digest('hex').slice(0, 10);
}

async function walkJpegs(dir, rel = '') {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walkJpegs(p, rel ? `${rel}/${e.name}` : e.name)));
    else if (/\.jpe?g$/i.test(e.name)) out.push({ file: p, name: e.name, chapter: rel || null });
  }
  return out;
}

// "20250325-IMG_3938.jpg" -> "img-3938"
function slugify(name) {
  return name.replace(/\.[^.]+$/, '').replace(/^\d{8}-/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Capture time as the camera's clock showed it, plus the clock's UTC offset and the camera model.
// The offset matters: e.g. in Spain the Canon was still on US Eastern time (-05:00) while the
// iPhone was on local time (+01:00/+02:00), so wall-clock times alone interleave wrongly.
async function captureInfo(file) {
  try {
    const { exif } = await sharp(file).metadata();
    const e = exif ? exifReader(exif) : {};
    const d = e.Photo?.DateTimeOriginal; // exif-reader returns the wall-clock time as a UTC Date
    return {
      clock: d instanceof Date && !isNaN(d) ? d.toISOString().slice(0, 19) : null,
      offset: e.Photo?.OffsetTimeOriginal ?? e.Photo?.OffsetTime ?? null,
      model: e.Image?.Model ?? null,
    };
  } catch { return { clock: null, offset: null, model: null }; }
}

const offsetMinutes = (o) => {
  const m = /^([+-])(\d{2}):?(\d{2})$/.exec(o ?? '');
  return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : null;
};

async function processPhoto(src, albumOut, prev) {
  const hash = await sha(src.file);
  const id = src.id;
  const cached = prev.get(hash);
  const widthsFor = (w) => [...new Set([...WIDTHS.filter((x) => x < w), Math.min(w, WIDTHS.at(-1))])];
  const fname = (w, ext) => `${id}-${hash}-${w}.${ext}`;

  const capture = await captureInfo(src.file); // cheap (header only); always re-read so sorting stays right

  if (cached && cached.id === id) {
    const all = cached.sizes.flatMap((w) => [fname(w, 'avif'), fname(w, 'jpg')]);
    if ((await Promise.all(all.map((f) => exists(path.join(albumOut, f))))).every(Boolean)) {
      return { entry: { ...cached, file: src.name, chapter: src.chapter }, capture, files: all, fresh: false };
    }
  }

  const meta = await sharp(src.file).metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const w = rotated ? meta.height : meta.width;
  const h = rotated ? meta.width : meta.height;
  const sizes = widthsFor(w);
  const files = [];

  for (const sw of sizes) {
    const base = () => sharp(src.file).rotate().resize({ width: sw }).toColorspace('srgb');
    await base().avif(AVIF).toFile(path.join(albumOut, fname(sw, 'avif')));
    await base().jpeg(JPEG).toFile(path.join(albumOut, fname(sw, 'jpg')));
    files.push(fname(sw, 'avif'), fname(sw, 'jpg'));
  }

  const lqip = await sharp(src.file).rotate().resize({ width: 24 }).toColorspace('srgb').webp({ quality: 40 }).toBuffer();
  const { dominant: c } = await sharp(src.file).rotate().resize({ width: 64 }).toColorspace('srgb').stats();
  const color = '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');

  return {
    entry: {
      id, hash, file: src.name, chapter: src.chapter,
      w, h, sizes,
      color,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    },
    capture,
    files,
    fresh: true,
  };
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
  }));
  return results;
}

async function buildAlbum(slug, fm) {
  const webDir = path.join(EXPORTS, String(fm.source), 'web');
  if (!(await exists(webDir))) throw new Error(`${slug}: ${webDir} does not exist`);
  const albumOut = path.join(OUT, slug);
  await fs.mkdir(albumOut, { recursive: true });
  await fs.mkdir(DATA, { recursive: true });

  const dataFile = path.join(DATA, `${slug}.json`);
  const prevData = (await exists(dataFile)) ? JSON.parse(await fs.readFile(dataFile, 'utf8')) : { photos: [] };
  const prev = new Map(prevData.photos.map((p) => [p.hash, p]));

  const sources = await walkJpegs(webDir);
  const seen = new Map();
  for (const s of sources) {
    let id = slugify(s.name);
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    s.id = n > 1 ? `${id}-${n}` : id;
  }

  let done = 0;
  const results = await pool(sources, CONCURRENCY, async (s) => {
    const r = await processPhoto(s, albumOut, prev);
    done++;
    if (r.fresh) process.stdout.write(`\r  ${slug}: ${done}/${sources.length} ${s.name.padEnd(40)}`);
    return r;
  });
  if (results.some((r) => r.fresh)) process.stdout.write('\n');

  // `date` = true capture instant in UTC (used only for ordering; never displayed).
  // Photos missing an offset borrow the most common offset of the same camera in this album.
  const usual = new Map();
  for (const { capture: c } of results) {
    if (c.offset == null) continue;
    const counts = usual.get(c.model) ?? new Map();
    counts.set(c.offset, (counts.get(c.offset) ?? 0) + 1);
    usual.set(c.model, counts);
  }
  const usualOffset = (model) => [...(usual.get(model) ?? new Map())].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const noDate = [], guessed = [];
  for (const r of results) {
    const c = r.capture;
    if (!c.clock) { r.entry.date = null; noDate.push(r.entry.file); continue; }
    let off = offsetMinutes(c.offset);
    if (off == null) { off = offsetMinutes(usualOffset(c.model)) ?? 0; guessed.push(r.entry.file); }
    r.entry.date = new Date(Date.parse(c.clock + 'Z') - off * 60000).toISOString().replace('.000Z', 'Z');
  }
  if (guessed.length) console.log(`  ${slug}: no timezone in ${guessed.length} photo(s), assumed same as camera's others: ${guessed.join(', ')}`);
  if (noDate.length) console.log(`  ${slug}: no capture time in ${noDate.length} photo(s), sorted last: ${noDate.join(', ')}`);

  // Chronological, chapters kept together in folder order.
  const photos = results.map((r) => r.entry).sort((a, b) =>
    (a.chapter ?? '').localeCompare(b.chapter ?? '') ||
    (a.date ?? '￿').localeCompare(b.date ?? '￿') ||
    a.file.localeCompare(b.file));

  // Delete web versions that no longer belong to any photo.
  const keep = new Set(results.flatMap((r) => r.files));
  let removed = 0;
  for (const f of await fs.readdir(albumOut)) {
    if (!keep.has(f)) { await fs.rm(path.join(albumOut, f)); removed++; }
  }

  await fs.writeFile(dataFile, JSON.stringify({ title: fm.title ?? slug, source: fm.source, photos }, null, 1) + '\n');
  const fresh = results.filter((r) => r.fresh).length;
  console.log(`  ${slug}: ${photos.length} photos (${fresh} processed, ${photos.length - fresh} unchanged, ${removed} stale files removed)`);
  return slug;
}

async function main() {
  const albums = [];
  for (const e of await fs.readdir(CONTENT, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const idx = path.join(CONTENT, e.name, '_index.md');
    if (!(await exists(idx))) continue;
    const fm = await frontMatter(idx);
    if (fm.source) albums.push([e.name, fm]);
  }
  if (!albums.length) { console.log('No albums with a `source:` in content/photography/*/_index.md'); return; }

  console.log(`Reading from ${EXPORTS}`);
  const built = [];
  for (const [slug, fm] of albums) built.push(await buildAlbum(slug, fm));

  // Remove output + data for albums that no longer exist.
  for (const dir of [OUT, DATA]) {
    if (!(await exists(dir))) continue;
    for (const f of await fs.readdir(dir)) {
      const slug = f.replace(/\.json$/, '');
      if (!f.startsWith('.') && !built.includes(slug)) {
        await fs.rm(path.join(dir, f), { recursive: true });
        console.log(`  removed old album output: ${path.relative(ROOT, path.join(dir, f))}`);
      }
    }
  }
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
