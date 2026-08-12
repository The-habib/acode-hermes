<div align="center">

# 🤖 Acode Hermes Agent

**Autonomous Nous Research Hermes Agent CLI Integration for Acode on Android**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/The-habib/acode-hermes)
[![Acode Version](https://img.shields.io/badge/Acode-v1.9.0%2B-blue.svg?style=for-the-badge)](https://acode.app)
[![Hermes Agent](https://img.shields.io/badge/Hermes_Agent-v0.19.0-purple.svg?style=for-the-badge)](https://hermes-agent.nousresearch.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/The-habib/acode-hermes?style=for-the-badge)](https://github.com/The-habib/acode-hermes/releases)

<p align="center">
  <b>Bring Nous Research's autonomous learning AI agent into Acode's native terminal with tool calling, memory graphs, and custom skills.</b>
</p>

[Quick Install](#-installation) • [Key Features](#-key-features) • [Usage](#-usage) • [Command Reference](#-command-palette-commands) • [Architecture](#-architecture) • [Troubleshooting](#-troubleshooting--diagnostics)

---

</div>

## 🌟 Overview

**Acode Hermes Agent** integrates **Nous Research's flagship Hermes Agent CLI (`hermes-agent`)** into **Acode Editor** on Android. Hermes Agent is an open-source, autonomous AI assistant that remembers past interactions, uses tools, learns skills, and manages tasks directly from your code workspace.

---

## ✨ Key Features

- 🧠 **Autonomous Agentic Capabilities**: Multi-step tool use, code execution, web search, memory graph persistence, and skill learning loops.
- 📺 **Interactive Terminal UI**: Full interactive session support inside Acode's native xterm.js server terminal tabs (`acode.require('terminal')`).
- 🧙 **Built-in Setup Wizard**: Integrated launcher for `hermes setup` to easily configure OpenAI, Gemini, OpenRouter, Anthropic, or local LLMs.
- ⌨️ **Keyboard Shortcuts**: Launch Hermes Agent instantly using `Ctrl+Alt+H` (`Cmd+Alt+H` on macOS).
- 🛠️ **Automated Environment Setup**: Python 3.12 & Pip package bootstrap (`hermes-agent` v0.19.0) with zero manual environment configuration.
- 📌 **Persistent PATH Hooks**: Automatically configures `$HOME/.local/bin` in `~/.bashrc`, `~/.profile`, and `~/.zshrc`.

---

## 📦 Installation

### Option 1: 1-Click Remote Installation in Acode (Recommended)

1. Open **Acode** on your Android device.
2. Navigate to **Settings** → **Plugins** → **`+`** → **Remote**.
3. Paste the official release URL:
   ```
   https://github.com/The-habib/acode-hermes/releases/download/v1.0.0/acode-hermes.zip
   ```
4. Tap **Install** and enjoy!

---

## 🎮 Usage

### 1. Terminal Command Line
Open Acode Terminal tab and run:

```sh
hermes
```

To run the interactive setup wizard and configure your LLM provider & API keys:

```sh
hermes setup
```

### 2. Acode Command Palette (`Ctrl+Shift+P`)
Search for **`Hermes`** to access all integrated actions:

| Command | Shortcut | Description |
| :--- | :--- | :--- |
| **`Hermes: Launch Agent`** | `Ctrl+Alt+H` | Launches `hermes` in an interactive Acode Terminal tab |
| **`Hermes: Setup Wizard`** | — | Opens interactive model & API key configuration wizard |
| **`Hermes: Status Check`** | — | Displays environment and provider diagnostic status |
| **`Hermes: Repair`** | — | Repairs Python package dependencies or permissions |
| **`Hermes: Update`** | — | Updates `hermes-agent` to the latest release |
| **`Hermes: Show Environment`** | — | Opens interactive status and settings dialog |

---

## ⚙️ Command Line Tooling Included

The plugin installs 5 helper utilities into `$HOME/.local/bin`:

| Utility | Description |
| :--- | :--- |
| `hermes` | Primary launcher for Nous Research Hermes Agent CLI |
| `hermes-setup` | Runs setup wizard for LLM models & secret keys |
| `hermes-check` | Performs environment diagnostic tests |
| `hermes-repair` | Self-healing script for Python package & path recovery |
| `hermes-update` | Upgrades `hermes-agent` via Pip |

---

## 🏗️ Architecture

```
 ┌───────────────────────────────────────────────────────────┐
 │                   Acode Android Editor                    │
 ├─────────────────────────────┬─────────────────────────────┤
 │    Acode Terminal API       │   Commands & Status Dialog  │
 └──────────────┬──────────────┴──────────────┬──────────────┘
                │                             │
                ▼                             ▼
 ┌───────────────────────────────────────────────────────────┐
 │                 Alpine Linux Container                    │
 ├───────────────────────────────────────────────────────────┤
 │  $HOME/.local/bin/hermes  ──►  Python 3.12 hermes-agent   │
 │                                       │                   │
 │                                       ▼                   │
 │                          Nous Research Agent Engine       │
 └───────────────────────────────────────────────────────────┘
```

| Component | Technical Detail |
| :--- | :--- |
| **Python Environment** | Python 3.12.13 with Pip wheel integration |
| **Agent Engine** | `hermes-agent` v0.19.0 (Nous Research) |
| **Terminal Integration** | `acode.require('terminal')` -> `createServer()` |
| **Manifest Spec** | Acode Plugin Standard v2 (minVersionCode: `292`) |

---

## 🔍 Troubleshooting & Diagnostics

If `hermes` ever requires inspection, run the diagnostic suite in terminal:

```sh
hermes status
```

Or run:

```sh
hermes-check
```

To repair permissions or upgrade dependencies, run:

```sh
hermes-repair
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on our [GitHub Repository](https://github.com/The-habib/acode-hermes).

```sh
# Clone project
git clone https://github.com/The-habib/acode-hermes.git
cd acode-hermes

# Install dependencies & build
npm install
npm run build
```

---

## 📄 License & Attribution

- **Plugin License**: [MIT License](LICENSE)
- **Developer & Maintainer**: Habib ([@The-habib](https://github.com/The-habib))
- **Core Agent Engine**: [Nous Research Hermes Agent](https://hermes-agent.nousresearch.com) (Nous Research)
