const fs = require('fs');
const path = require('path');

console.log('=== DIRECT ACODE HERMES AGENT INSTALLER ===');

const homeDir = process.env.HOME || '/home';
const localBin = path.join(homeDir, '.local/bin');

if (!fs.existsSync(localBin)) fs.mkdirSync(localBin, { recursive: true });

const scripts = {
  'hermes': `#!/bin/sh
HERMES_BIN="/usr/bin/hermes"
if [ ! -f "$HERMES_BIN" ]; then
    pip install --break-system-packages hermes-agent || exit 1
fi
exec "$HERMES_BIN" "$@"
`,
  'hermes-check': `#!/bin/sh
echo "=== HERMES AGENT DIAGNOSTICS ==="
echo "Python: $(python3 --version 2>&1)"
echo "Hermes Binary: /usr/bin/hermes"
if [ -f /usr/bin/hermes ]; then
    /usr/bin/hermes --version 2>&1
else
    echo "Hermes binary missing"
fi
`,
  'hermes-setup': `#!/bin/sh
echo "Running Hermes Agent setup wizard..."
exec /usr/bin/hermes setup
`,
  'hermes-repair': `#!/bin/sh
chmod +x /usr/bin/hermes 2>/dev/null || true
pip install --break-system-packages --upgrade hermes-agent
`,
  'hermes-update': `#!/bin/sh
pip install --break-system-packages --upgrade hermes-agent
`
};

for (const [name, content] of Object.entries(scripts)) {
  const target = path.join(localBin, name);
  fs.writeFileSync(target, content, { mode: 0o755 });
  console.log(`Installed launcher: ${target}`);
}

const pluginSrcDir = path.resolve(__dirname, '..');
const pluginId = 'com.acode.hermes';

const targetDirs = [
  `/storage/emulated/0/Android/data/com.foxdebug.acodefree/files/plugins/${pluginId}`,
  `/storage/emulated/0/Android/data/com.foxdebug.acode/files/plugins/${pluginId}`,
  `/data/data/com.foxdebug.acodefree/files/plugins/${pluginId}`,
  `/data/data/com.foxdebug.acode/files/plugins/${pluginId}`,
];

const filesToCopy = [
  'plugin.json',
  'README.md',
  'CHANGELOG.md',
  'icon.png',
  'dist/main.js',
];

for (const destDir of targetDirs) {
  try {
    const parentDir = path.dirname(destDir);
    if (!fs.existsSync(parentDir)) continue;

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const distSub = path.join(destDir, 'dist');
    if (!fs.existsSync(distSub)) fs.mkdirSync(distSub, { recursive: true });

    for (const rel of filesToCopy) {
      const src = path.join(pluginSrcDir, rel);
      const dest = path.join(destDir, rel);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }
    console.log(`Directly injected Hermes plugin into: ${destDir}`);
  } catch (err) {
    console.warn(`Note: Could not copy to ${destDir}: ${err.message}`);
  }
}

console.log('=== DIRECT INSTALLATION COMPLETE ===');
