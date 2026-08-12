const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('==================================================');
console.log('  AUTOMATED ACODE PLUGIN VALIDATOR — HERMES AGENT ');
console.log('==================================================');

const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'dist');
const zipPath = path.join(distDir, 'acode-hermes.zip');

let errors = 0;

function logPass(msg) {
  console.log(` [PASS] ${msg}`);
}

function logFail(msg) {
  console.error(` [FAIL] ${msg}`);
  errors++;
}

// 1. Manifest
const manifestPath = path.join(projectDir, 'plugin.json');
if (!fs.existsSync(manifestPath)) {
  logFail('plugin.json file is missing!');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.id === 'com.acode.hermes') logPass(`Manifest ID: ${manifest.id}`);
  else logFail(`Invalid manifest ID: ${manifest.id}`);
}

// 2. Required Files
const reqFiles = ['plugin.json', 'README.md', 'CHANGELOG.md', 'icon.png', 'dist/main.js'];
for (const f of reqFiles) {
  if (fs.existsSync(path.join(projectDir, f))) logPass(`File exists: ${f}`);
  else logFail(`File missing: ${f}`);
}

// 3. Syntax check
if (fs.existsSync(path.join(distDir, 'main.js'))) {
  try {
    execSync(`node -c "${path.join(distDir, 'main.js')}"`);
    logPass('dist/main.js syntax check passed');
  } catch (e) {
    logFail('dist/main.js syntax error');
  }
}

if (errors > 0) {
  console.error('Validation FAILED!');
  process.exit(1);
} else {
  console.log('Validation PASSED SUCCESSFULLY!');
  process.exit(0);
}
