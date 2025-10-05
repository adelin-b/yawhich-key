# yawhich-key (Tauri Rewrite)

A modern, cross-platform keyboard shortcut manager inspired by Emacs which-key, built with Tauri 2.0, React, and TypeScript.

## Features

- 🚀 Native performance with Rust backend
- ⌨️ Global keyboard shortcuts (default: Super+Space)
- 📝 YAML-based configuration (compatible with original format)
- 🎨 Clean, modern UI
- 🔧 Extensible keymap system with nested shortcuts
- 💻 Cross-platform (macOS, Linux, Windows)
- 🪶 Lightweight and fast

## Prerequisites

- [Rust](https://www.rust-lang.org/) (install via `brew install rust` on macOS)
- [Bun](https://bun.sh/) (for frontend development)
- macOS/Linux/Windows

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run tauri:dev
```

## Build

```bash
# Build for production
bun run tauri:build
```

## Configuration

Configuration files are located in `~/.config/yawhich-key/` (or `$XDG_CONFIG_HOME/yawhich-key`).

### Directory Structure

```
~/.config/yawhich-key/
├── config.yaml          # Main configuration
└── layers/
    ├── core.yaml        # Default keymaps
    └── *.yaml           # Application-specific keymaps
```

### Example Configuration

`~/.config/yawhich-key/config.yaml`:

```yaml
commands:
  editor: code
  terminal: kitty
  terminal_hold: kitty --hold
  music: spotify
  file_manager: dolphin
  browser: vivaldi-snapshot
```

`~/.config/yawhich-key/layers/core.yaml`:

```yaml
name: core.yaml

keymaps:
  +apps:
    +file: $file_manager
    +terminal: $terminal
    +browser: $browser
    +editor: $editor
  +system:
    +lock: systemctl suspend
    +reboot: systemctl reboot
```

## Usage

1. Press `Super+Space` (⌘+Space on macOS) to open the which-key menu
2. Press keys shown in the menu to navigate or execute commands
3. Press `Esc` to close the menu

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri 2.0
- **Global Shortcuts**: tauri-plugin-global-shortcut
- **Config Parsing**: serde_yaml
- **Command Execution**: Rust std::process

## Migration from Original

The Tauri version maintains compatibility with the original YAML configuration format. Simply copy your existing layers to `~/.config/yawhich-key/layers/`.

## License

Same as original yawhich-key project.
