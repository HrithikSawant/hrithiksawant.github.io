#!/usr/bin/env node
// Publish Obsidian notes as Chirpy posts.
//   node scripts/sync-obsidian.mjs "/path/to/Vault"        (or set OBSIDIAN_VAULT)
//   add --dry-run to see what would change without writing anything
//
// Only notes with `publish: true` in their frontmatter are synced. Posts created by this
// script carry `synced_from: obsidian`; those are rebuilt on every run, so un-publishing a
// note removes its post. Posts you write by hand in _posts/ are never touched.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const vault = args.find(a => !a.startsWith("--")) || process.env.OBSIDIAN_VAULT;
if (!vault || !fs.existsSync(vault)) {
  console.error('Usage: node scripts/sync-obsidian.mjs "/path/to/Vault" [--dry-run]');
  process.exit(1);
}
const root = process.cwd();
const postsDir = path.join(root, "_posts");
const imgRoot = path.join(root, "assets", "img", "posts", "obsidian");
const TZ = "+0530";

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
  if (e.name.startsWith(".")) return [];
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const files = walk(vault);
const mdFiles = files.filter(f => f.endsWith(".md"));
const byBase = new Map(files.filter(f => !f.endsWith(".md")).map(f => [path.basename(f), f]));

// Small YAML subset: key: value, key: [a, b], and key: followed by "- item" lines.
function parseFM(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return [{}, txt];
  const fm = {}; let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && key) { (fm[key] = Array.isArray(fm[key]) ? fm[key] : []).push(unq(item[1])); continue; }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1]; const v = kv[2].trim();
    if (v === "") fm[key] = [];
    else if (v.startsWith("[")) fm[key] = v.slice(1, -1).split(",").map(s => unq(s.trim())).filter(Boolean);
    else fm[key] = unq(v);
  }
  return [fm, txt.slice(m[0].length)];
}
const unq = s => s.replace(/^["']|["']$/g, "");
const asList = v => Array.isArray(v) ? v : v ? String(v).split(",").map(s => s.trim()).filter(Boolean) : [];
const yamlStr = s => JSON.stringify(String(s));

// Pass 1: find published notes
const published = [];
for (const f of mdFiles) {
  const [fm, body] = parseFM(fs.readFileSync(f, "utf8"));
  if (String(fm.publish).toLowerCase() !== "true") continue;
  const title = fm.title || path.basename(f, ".md");
  const d = fm.date ? new Date(fm.date) : fs.statSync(f).mtime;
  const date = isNaN(d) ? fs.statSync(f).mtime : d;
  published.push({ f, fm, body, title, slug: slugify(title), date });
}
const bySlugTitle = new Map(published.map(p => [p.title.toLowerCase(), p]));

const CALLOUT = { note: "info", info: "info", abstract: "info", tip: "tip", hint: "tip", success: "tip",
  warning: "warning", caution: "warning", danger: "danger", error: "danger", bug: "danger", failure: "danger" };

function convert(p) {
  let text = p.body.replace(/%%[\s\S]*?%%/g, "").replace(/==([^=\n]+)==/g, "<mark>$1</mark>");
  const copied = [];
  const imgUrl = name => {
    const src = byBase.get(path.basename(name));
    if (!src) return null;
    copied.push(src);
    return `/assets/img/posts/obsidian/${p.slug}/${encodeURIComponent(path.basename(src))}`;
  };
  // ![[image.png|alt]] embeds
  text = text.replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, n, alt) => {
    const u = imgUrl(n); return u ? `![${/^\d+(x\d+)?$/.test(alt || "") ? "" : alt || ""}](${u})` : "";
  });
  // ![alt](relative/path.png) images
  text = text.replace(/!\[([^\]]*)\]\((?!https?:|\/)([^)]+)\)/g, (m, alt, n) => {
    const u = imgUrl(decodeURI(n)); return u ? `![${alt}](${u})` : m;
  });
  // [[Note|alias]] and [[Note#Heading]] links
  text = text.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, target, alias) => {
    const hit = bySlugTitle.get(target.trim().toLowerCase());
    const label = alias || target.trim();
    return hit ? `[${label}](/posts/${hit.slug}/)` : label;
  });
  // > [!tip] Title  ->  Chirpy prompt blocks
  const lines = text.split("\n"), out = [];
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^>\s*\[!(\w+)\][+-]?\s*(.*)$/);
    if (!h) { out.push(lines[i]); continue; }
    const kind = CALLOUT[h[1].toLowerCase()] || "info";
    if (h[2]) out.push(`> **${h[2]}**`);
    while (i + 1 < lines.length && lines[i + 1].startsWith(">")) out.push(lines[++i]);
    out.push(`{: .prompt-${kind} }`);
  }
  return { body: out.join("\n").trim() + "\n", copied };
}

// Remove posts from the previous sync, then write the new ones
const previous = fs.existsSync(postsDir)
  ? walk(postsDir).filter(f => f.endsWith(".md") && /^synced_from:\s*obsidian\s*$/m.test(fs.readFileSync(f, "utf8"))) : [];
if (!dry) {
  previous.forEach(f => fs.rmSync(f));
  fs.rmSync(imgRoot, { recursive: true, force: true });
  fs.mkdirSync(postsDir, { recursive: true });
}
for (const p of published) {
  const { body, copied } = convert(p);
  const d = p.date, pad = n => String(n).padStart(2, "0");
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const stamp = `${day} ${pad(d.getHours())}:${pad(d.getMinutes())}:00 ${TZ}`;
  const cats = asList(p.fm.categories).slice(0, 2);
  const tags = asList(p.fm.tags).map(t => t.replace(/^#/, "").toLowerCase());
  const summary = p.fm.summary || p.fm.description || "";
  const fm = ["---", `title: ${yamlStr(p.title)}`, `date: ${stamp}`,
    `categories: [${(cats.length ? cats : ["Notes"]).map(yamlStr).join(", ")}]`,
    `tags: [${tags.map(yamlStr).join(", ")}]`,
    ...(summary ? [`description: ${yamlStr(summary)}`] : []),
    "synced_from: obsidian", "---", ""].join("\n");
  const outFile = path.join(postsDir, `${day}-${p.slug}.md`);
  console.log(`${dry ? "[dry] " : ""}${path.relative(root, outFile)}  (${copied.length} image${copied.length === 1 ? "" : "s"})`);
  if (dry) continue;
  fs.writeFileSync(outFile, fm + "\n" + body);
  for (const src of new Set(copied)) {
    const dest = path.join(imgRoot, p.slug, path.basename(src));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
console.log(`${published.length} note(s) published, ${previous.length} earlier synced post(s) replaced.`);
