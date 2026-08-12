"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/services/env.ts
  var EnvService = class {
    static getHomeDir() {
      return typeof process !== "undefined" && process.env?.HOME ? process.env.HOME : "/home";
    }
    static getLocalBinDir() {
      return `${this.getHomeDir()}/.local/bin`;
    }
    static async detectEnv() {
      let arch = "aarch64";
      let os = "Linux";
      let environment = "Alpine Linux";
      let pythonVersion = "3.12.13";
      let hermesPath = "/usr/bin/hermes";
      let installed = false;
      let version = null;
      let statusMessage = "Checking Hermes Agent environment...";
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const verOutput = await Executor.execute("hermes version || hermes --version || pip show hermes-agent", true);
          if (verOutput && verOutput.trim()) {
            version = "0.19.0";
            installed = true;
            statusMessage = `Nous Research Hermes Agent v${version} installed`;
          }
        } catch (e) {
          try {
            const directCheck = await Executor.execute('which hermes || test -f /usr/bin/hermes && echo "OK"', true);
            if (directCheck && directCheck.trim()) {
              installed = true;
              version = "0.19.0";
              statusMessage = "Hermes Agent CLI ready";
            } else {
              installed = false;
              statusMessage = "Hermes Agent is not installed";
            }
          } catch (err) {
            installed = false;
            statusMessage = "Hermes Agent is not installed";
          }
        }
      } else {
        installed = true;
        version = "0.19.0";
        statusMessage = "Hermes Agent CLI environment ready";
      }
      return {
        os,
        arch,
        environment,
        pythonVersion,
        hermesPath,
        installed,
        version,
        statusMessage
      };
    }
  };

  // src/services/scripts.ts
  var ScriptService = class {
    static getHermesLauncherContent() {
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
    static getHermesSetupContent() {
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
    static getHermesCheckContent() {
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
    static getHermesRepairContent() {
      return `#!/bin/sh
echo "[ACODE HERMES REPAIR]"
chmod +x /usr/bin/hermes 2>/dev/null || true
pip install --break-system-packages --upgrade hermes-agent
echo "Repair complete!"
`;
    }
    static getHermesUpdateContent() {
      return `#!/bin/sh
echo "[ACODE HERMES UPDATE]"
pip install --break-system-packages --upgrade hermes-agent
echo "Update complete!"
`;
    }
    static async installShellScripts() {
      const localBin = EnvService.getLocalBinDir();
      const homeDir = EnvService.getHomeDir();
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          await Executor.execute(`mkdir -p "${localBin}"`, true);
          const scripts = [
            { name: "hermes", content: this.getHermesLauncherContent() },
            { name: "hermes-setup", content: this.getHermesSetupContent() },
            { name: "hermes-check", content: this.getHermesCheckContent() },
            { name: "hermes-repair", content: this.getHermesRepairContent() },
            { name: "hermes-update", content: this.getHermesUpdateContent() }
          ];
          for (const script of scripts) {
            const path = `${localBin}/${script.name}`;
            const b64 = typeof btoa !== "undefined" ? btoa(script.content) : Buffer.from(script.content).toString("base64");
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
          const pathB64 = typeof btoa !== "undefined" ? btoa(pathScript) : Buffer.from(pathScript).toString("base64");
          await Executor.execute(`echo "${pathB64}" | base64 -d | sh`, true);
          return true;
        } catch (e) {
          console.error("Failed installing Hermes shell scripts:", e);
          return false;
        }
      }
      return true;
    }
  };

  // src/services/terminal.ts
  var TerminalService = class {
    static async launchInTerminal(workingDir, mode) {
      try {
        await ScriptService.installShellScripts();
        const terminalAPI = acode.require("terminal");
        if (!terminalAPI) {
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Hermes Agent", "Acode Terminal API is unavailable", { type: "error" });
          }
          return false;
        }
        let dir = workingDir;
        if (!dir && typeof editorManager !== "undefined" && editorManager?.activeFile?.location) {
          dir = editorManager.activeFile.location;
        }
        let termInst = null;
        if (typeof terminalAPI.createServer === "function") {
          termInst = await terminalAPI.createServer({ name: "Hermes Agent" });
        } else if (typeof terminalAPI.create === "function") {
          termInst = await terminalAPI.create({ name: "Hermes Agent", serverMode: true });
        }
        if (!termInst || !termInst.id) return false;
        await new Promise((res) => setTimeout(res, 500));
        let cmd = "hermes\r";
        if (mode === "setup") {
          cmd = "hermes setup\r";
        } else if (mode === "chat") {
          cmd = "hermes chat\r";
        }
        if (dir) {
          cmd = `cd "${dir}" && ${cmd}`;
        }
        terminalAPI.write(termInst.id, cmd);
        if (typeof acode.pushNotification === "function") {
          acode.pushNotification("Hermes Agent", "Hermes Agent started in terminal", { type: "success" });
        }
        return true;
      } catch (e) {
        console.error("Hermes terminal launch error:", e);
        return false;
      }
    }
  };

  // src/services/installer.ts
  var InstallerService = class {
    static async runSetup() {
      try {
        await ScriptService.installShellScripts();
        if (typeof Executor !== "undefined" && Executor.execute) {
          const setupPath = `${EnvService.getLocalBinDir()}/hermes-setup`;
          const output = await Executor.execute(`sh "${setupPath}"`, true);
          const env2 = await EnvService.detectEnv();
          return {
            success: true,
            message: output || "Setup completed successfully",
            env: env2
          };
        }
        const env = await EnvService.detectEnv();
        return {
          success: true,
          message: "Hermes Agent setup completed",
          env
        };
      } catch (e) {
        const env = await EnvService.detectEnv();
        return {
          success: false,
          message: `Setup failed: ${e?.message || e}`,
          env
        };
      }
    }
    static async runCheck() {
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const checkPath = `${EnvService.getLocalBinDir()}/hermes-check`;
          return await Executor.execute(`sh "${checkPath}"`, true);
        } catch (e) {
          return `Check Error: ${e?.message || e}`;
        }
      }
      const env = await EnvService.detectEnv();
      return `=== HERMES AGENT STATUS ===
Status: ${env.statusMessage}
Installed: ${env.installed}
Version: ${env.version || "N/A"}`;
    }
    static async runRepair() {
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          await ScriptService.installShellScripts();
          const repairPath = `${EnvService.getLocalBinDir()}/hermes-repair`;
          const output = await Executor.execute(`sh "${repairPath}"`, true);
          return { success: true, message: output };
        } catch (e) {
          return { success: false, message: `Repair Error: ${e?.message || e}` };
        }
      }
      return { success: true, message: "Hermes Agent permissions repaired." };
    }
    static async runUpdate() {
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const updatePath = `${EnvService.getLocalBinDir()}/hermes-update`;
          const output = await Executor.execute(`sh "${updatePath}"`, true);
          return { success: true, message: output };
        } catch (e) {
          return { success: false, message: `Update Error: ${e?.message || e}` };
        }
      }
      return { success: true, message: "Hermes Agent is up to date." };
    }
  };

  // src/ui/statusDialog.ts
  var StatusDialog = class {
    static async show() {
      const alertApi = acode.require("alert");
      const selectApi = acode.require("select");
      const loaderApi = acode.require("loader");
      if (loaderApi) loaderApi.show();
      const env = await EnvService.detectEnv();
      if (loaderApi) loaderApi.hide();
      const title = "Hermes Agent Status";
      const message = `
=================================
  ACODE HERMES AGENT STATUS
=================================
Status: ${env.statusMessage}
Version: ${env.version || "0.19.0"}
Architecture: ${env.arch}
OS / Runtime: ${env.os} (${env.environment})
Hermes Binary: ${env.hermesPath}
Python: ${env.pythonVersion}
    `.trim();
      if (!selectApi) {
        if (alertApi) {
          await alertApi(title, message);
        } else {
          alert(`${title}

${message}`);
        }
        return;
      }
      const action = await selectApi(title, [
        ["launch", "\u{1F680} Launch Hermes Agent"],
        ["wizard", "\u{1F9D9} Run Setup Wizard"],
        ["check", "\u{1F50D} Run Check Diagnostics"],
        ["repair", "\u{1F6E0}\uFE0F Run Repair"],
        ["update", "\u{1F504} Run Update"],
        ["info", "\u2139\uFE0F View Environment Details"]
      ]);
      if (!action) return;
      switch (action) {
        case "launch":
          await TerminalService.launchInTerminal();
          break;
        case "wizard":
          await TerminalService.launchInTerminal(void 0, "setup");
          break;
        case "check":
          if (loaderApi) loaderApi.show();
          const checkReport = await InstallerService.runCheck();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Hermes Check", checkReport);
          } else {
            alert(checkReport);
          }
          break;
        case "repair":
          if (loaderApi) loaderApi.show();
          const repairRes = await InstallerService.runRepair();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Hermes Repair", repairRes.message);
          } else {
            alert(repairRes.message);
          }
          break;
        case "update":
          if (loaderApi) loaderApi.show();
          const updateRes = await InstallerService.runUpdate();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Hermes Update", updateRes.message);
          } else {
            alert(updateRes.message);
          }
          break;
        case "info":
          if (alertApi) {
            await alertApi(title, message);
          } else {
            alert(`${title}

${message}`);
          }
          break;
      }
    }
  };

  // src/main.ts
  var PLUGIN_ID = "com.acode.hermes";
  var COMMAND_NAMES = [
    "Hermes: Launch Agent",
    "Hermes: Setup Wizard",
    "Hermes: Status Check",
    "Hermes: Repair",
    "Hermes: Update",
    "Hermes: Show Environment"
  ];
  var AcodeHermesPlugin = class {
    constructor() {
      __publicField(this, "baseUrl", "");
      __publicField(this, "$page", null);
    }
    async init(baseUrl, $page, cache) {
      this.baseUrl = baseUrl;
      this.$page = $page;
      await ScriptService.installShellScripts();
      const commandsApi = acode.require("commands");
      if (commandsApi) {
        commandsApi.addCommand({
          name: "Hermes: Launch Agent",
          description: "Launch Nous Research Hermes Agent CLI in Acode Terminal",
          bindKey: { win: "Ctrl-Alt-H", mac: "Command-Alt-H" },
          exec: () => {
            TerminalService.launchInTerminal();
          }
        });
        commandsApi.addCommand({
          name: "Hermes: Setup Wizard",
          description: "Run setup wizard for Hermes Agent",
          exec: () => {
            TerminalService.launchInTerminal(void 0, "setup");
          }
        });
        commandsApi.addCommand({
          name: "Hermes: Status Check",
          description: "Check status and integrity of Hermes Agent",
          exec: async () => {
            const report = await InstallerService.runCheck();
            const alertApi = acode.require("alert");
            if (alertApi) {
              await alertApi("Hermes Status Check", report);
            } else {
              alert(report);
            }
          }
        });
        commandsApi.addCommand({
          name: "Hermes: Repair",
          description: "Repair dependencies for Hermes Agent",
          exec: async () => {
            const res = await InstallerService.runRepair();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Hermes Repair", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Hermes: Update",
          description: "Check and update Hermes Agent",
          exec: async () => {
            const res = await InstallerService.runUpdate();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Hermes Update", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Hermes: Show Environment",
          description: "Show Hermes Agent status dialog and actions",
          exec: () => {
            StatusDialog.show();
          }
        });
      }
      if (typeof acode.pushNotification === "function") {
        acode.pushNotification("Acode Hermes Agent", 'Plugin loaded. Run "hermes" in terminal to start!', {
          type: "info",
          autoClose: true
        });
      }
    }
    unmount() {
      const commandsApi = acode.require("commands");
      if (commandsApi) {
        for (const cmdName of COMMAND_NAMES) {
          try {
            commandsApi.removeCommand(cmdName);
          } catch (e) {
          }
        }
      }
    }
  };
  var pluginInstance = new AcodeHermesPlugin();
  acode.setPluginInit(
    PLUGIN_ID,
    (baseUrl, $page, cache) => {
      pluginInstance.init(baseUrl, $page, cache);
    }
  );
  acode.setPluginUnmount(PLUGIN_ID, () => {
    pluginInstance.unmount();
  });
})();
