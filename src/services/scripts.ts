import { EnvService } from './env';

export class ScriptService {
  public static getHermesLauncherContent(): string {
    return `#!/bin/sh
# Nous Research Hermes Agent Launcher for Acode Terminal

HERMES_BIN="/usr/bin/hermes"

if [ ! -f "$HERMES_BIN" ]; then
    echo "[ACODE HERMES] Hermes Agent binary missing. Installing via pip..."
    pip install --break-system-packages hermes-agent || exit 1
fi

exec "$HERMES_BIN" "$@"
`;
  }

  public static getHermesSetupContent(): string {
    return `#!/bin/sh
set -e
echo "=========================================="
echo "  ACODE HERMES AGENT SETUP (NOUS RESEARCH)"
echo "=========================================="

echo "[1/3] Checking Python & Package Manager..."
apk add python3 py3-pip 2>/dev/null || true

echo "[2/3] Installing/Upgrading hermes-agent..."
pip install --break-system-packages --upgrade hermes-agent

echo "[3/3] Running Hermes setup..."
exec /usr/bin/hermes setup
`;
  }

  public static getHermesCheckContent(): string {
    return `#!/bin/sh
echo "=== HERMES AGENT DIAGNOSTIC CHECK ==="
echo "Python: $(python3 --version 2>&1)"
echo "Pip: $(pip --version 2>&1)"
echo "Hermes Binary: $(which hermes 2>&1)"

if [ -f /usr/bin/hermes ]; then
    echo "[STATUS] PASS - Hermes CLI is installed"
    /usr/bin/hermes --version 2>&1
else
    echo "[STATUS] FAIL - Run 'hermes-setup' to install"
fi
`;
  }

  public static getHermesRepairContent(): string {
    return `#!/bin/sh
echo "[ACODE HERMES REPAIR]"
chmod +x /usr/bin/hermes 2>/dev/null || true
pip install --break-system-packages --upgrade hermes-agent
echo "Repair complete!"
`;
  }

  public static getHermesUpdateContent(): string {
    return `#!/bin/sh
echo "[ACODE HERMES UPDATE]"
pip install --break-system-packages --upgrade hermes-agent
echo "Update complete!"
`;
  }

  public static async installShellScripts(): Promise<boolean> {
    const localBin = EnvService.getLocalBinDir();
    const homeDir = EnvService.getHomeDir();

    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        await Executor.execute(`mkdir -p "${localBin}"`, true);

        const scripts = [
          { name: 'hermes', content: this.getHermesLauncherContent() },
          { name: 'hermes-setup', content: this.getHermesSetupContent() },
          { name: 'hermes-check', content: this.getHermesCheckContent() },
          { name: 'hermes-repair', content: this.getHermesRepairContent() },
          { name: 'hermes-update', content: this.getHermesUpdateContent() },
        ];

        for (const script of scripts) {
          const path = `${localBin}/${script.name}`;
          const b64 = typeof btoa !== 'undefined' ? btoa(script.content) : Buffer.from(script.content).toString('base64');
          await Executor.execute(`echo "${b64}" | base64 -d > "${path}" && chmod +x "${path}"`, true);
        }

        const pathScript = `
for P in "${homeDir}/.bashrc" "${homeDir}/.profile" "${homeDir}/.zshrc"; do
    touch "$P" 2>/dev/null || true
    if ! grep -q "${localBin}" "$P"; then
        echo 'export PATH="${localBin}:$PATH"' >> "$P"
    fi
done
`;
        const pathB64 = typeof btoa !== 'undefined' ? btoa(pathScript) : Buffer.from(pathScript).toString('base64');
        await Executor.execute(`echo "${pathB64}" | base64 -d | sh`, true);

        return true;
      } catch (e) {
        console.error('Failed installing Hermes shell scripts:', e);
        return false;
      }
    }
    return true;
  }
}
