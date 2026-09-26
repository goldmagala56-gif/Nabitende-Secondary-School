// rebrand.js
// One-time bulk find/replace: EduConnect green branding -> Nabitende SS palette.
// Run from the nabitende-app project root:
//   node rebrand.js
//
// It walks src/ and index.html, applies the replacements below, and
// only rewrites a file if something actually changed. It prints a
// summary at the end so you can see exactly what was touched.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TARGET_DIRS = [path.join(ROOT, 'src')];
const TARGET_FILES = [path.join(ROOT, 'index.html')];
const EXTENSIONS = new Set(['.jsx', '.js', '.css', '.html']);

// Order matters: longer/more specific strings first so we never
// partially clobber a longer hex/string with a shorter one.
const REPLACEMENTS = [
  // Text branding
  ['EduConnect', 'Nabitende SS'],

  // Role label (Sidebar.jsx nav label only — route paths like
  // /government/dashboard are left alone on purpose)
  [`label: 'Government'`, `label: 'Board of Governors'`],

  // Primary brand color + its hover/active shades
  ['#1a6b4a', '#007ACC'],
  ['#15573c', '#0069ad'],
  ['#124a33', '#005c99'],

  // Secondary accent (was a generic blue, now school-sky)
  ['#2563eb', '#1F9CF0'],

  // Amber -> school gold
  ['#f59e0b', '#D9A438'],

  // Old "government" role color -> school-navy
  ['#1d4ed8', '#0B1B3F'],

  // Focus-ring rgba that mirrored the old primary green
  ['rgba(26, 107, 74, 0.12)', 'rgba(0, 122, 204, 0.12)'],
  ['rgba(26,107,74,0.12)', 'rgba(0,122,204,0.12)'],

  // Touch-target font stack -> accent font
  [
    `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`,
    `font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Verdana, sans-serif;`,
  ],
];

let filesChanged = 0;
let totalReplacements = 0;
const changedFiles = [];

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.has(ext)) return;

  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;
  let fileReplacementCount = 0;

  for (const [oldStr, newStr] of REPLACEMENTS) {
    const count = content.split(oldStr).length - 1;
    if (count > 0) {
      content = content.split(oldStr).join(newStr);
      fileReplacementCount += count;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    totalReplacements += fileReplacementCount;
    changedFiles.push({ file: path.relative(ROOT, filePath), count: fileReplacementCount });
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

console.log('Starting Nabitende SS rebrand pass...\n');

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) walk(dir);
}
for (const file of TARGET_FILES) {
  if (fs.existsSync(file)) processFile(file);
}

console.log(`Done. ${filesChanged} file(s) changed, ${totalReplacements} replacement(s) made.\n`);
if (changedFiles.length) {
  console.log('Changed files:');
  for (const { file, count } of changedFiles) {
    console.log(`  ${file}  (${count})`);
  }
} else {
  console.log('No matches found — check the REPLACEMENTS list against your actual file contents.');
}