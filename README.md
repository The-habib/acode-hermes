# Acode Hermes Agent

Native Nous Research Hermes Agent CLI integration plugin for Acode editor on Android.

## Features

- **Native Hermes Agent**: Runs the official Nous Research Hermes Agent (`hermes`) CLI directly inside Acode's native terminal.
- **Terminal Integration**: Launches Hermes Agent in interactive server terminal tabs using Acode's official Terminal API (`acode.require('terminal')`).
- **Commands Palette**: Register commands for Launching, Setup Wizard, Diagnostics, Repair, and Update.
- **Auto Environment Preparation**: Automatically installs Python dependencies (`pip install hermes-agent`) on demand.

## Usage

In Acode Terminal, run:

```sh
hermes
```

Or open Command Palette (`Ctrl+Shift+P`) and select `Hermes: Launch Agent`.

## Author & Credits

- **Author**: Nous Research & Antigravity Team
- **Repository**: [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- **License**: MIT
