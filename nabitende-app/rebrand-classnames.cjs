// rebrand-classnames.cjs (v2 - case-insensitive)
// Converts Tailwind arbitrary-value hex classNames
// (e.g. bg-[#007ACC], hover:border-[#0069ad], focus:ring-[#007acc]/10)
// into the named school-* tokens now defined in tailwind.config.js.
//
// Case-insensitive on the hex digits, since some editors/formatters
// lowercase hex colors automatically.
//
// Run from the nabitende-app project root:
//   node rebrand-classnames.cjs

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TARGET_DIRS = [path.join(ROOT, 'src')];
const EXTENSIONS = new Set(['.jsx', '.js']);

// [hexDigits, replacementToken] - hex digits matched case-insensitively
const REPLACEMENTS = [
  ['007ACC', 'school-blue'],
  ['0069AD', 'school-blue-hover'],
  ['005C99', 'school-blue-active'],
  ['1F9CF0', 'school-sky'],
  ['D9A438', 'school-accent'],
  ['0B1B3F', 'school-navy'],
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

  for (const [hex, token] of REPLACEMENTS) {
    // Matches -[#007acc] or -[#007ACC] etc., keeps any trailing /opacity
    const re = new RegExp('-\\[#' + hex + '\\]', 'gi');
    const matches = content.match(re);
    if (matches) {
      fileReplacementCount += matches.length;
      content = content.replace(re, '-' + token);
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

console.log('Starting className cleanup pass (arbitrary hex -> school-* tokens)...\n');

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    console.log(`Scanning: ${dir}`);
    walk(dir);
  } else {
    console.log(`WARNING: directory not found: ${dir}`);
  }
}

console.log(`\nDone. ${filesChanged} file(s) changed, ${totalReplacements} replacement(s) made.\n`);
if (changedFiles.length) {
  console.log('Changed files:');
  for (const { file, count } of changedFiles) {
    console.log(`  ${file}  (${count})`);
  }
} else {
  console.log('No matches found.');
}
