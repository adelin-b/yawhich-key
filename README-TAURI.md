# yawhich-key (Tauri Rewrite)

A modern, cross-platform keyboard shortcut manager inspired by Emacs which-key, built with Tauri 2.0, React, and TypeScript.

## Features

- 🚀 Native performance with Rust backend
- ⌨️ Global keyboard shortcuts (default: Ctrl+Option+Space)
- 🎯 **Major Mode**: App-specific keymaps (Ctrl+Option+,)
- 📝 YAML-based configuration (compatible with original format)
- 🎨 Clean, modern UI with configurable animations
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
├── settings.yaml        # Application settings
└── layers/
    ├── core.yaml        # Global keymaps (Ctrl+Option+Space)
    ├── vscode.yaml      # VSCode major mode
    ├── browser.yaml     # Browser major mode
    └── *.yaml           # Other app-specific keymaps
```

### Settings

`~/.config/yawhich-key/settings.yaml`:

```yaml
# Enable or disable animations
# Set to false for instant appearance/disappearance
animations: true
```

### Core Layer Example

`~/.config/yawhich-key/layers/core.yaml`:

```yaml
name: core.yaml

keymaps:
  +apps:
    +terminal: open -a Alacritty
    +browser: open https://
    +finder: open -a Finder
    +editor: open -a "Visual Studio Code"
  +system:
    +lock: pmset displaysleepnow
    +sleep: pmset sleepnow
  +media:
    +play-pause: osascript -e 'tell application "Music" to playpause'
    +next-track: osascript -e 'tell application "Music" to next track'
```

**Note**: Commands can be anything you want - shell scripts, AppleScript, or any executable. The yabai window manager is NOT required.

## Usage

### Global Mode

1. Press `Ctrl+Option+Space` to open the global which-key menu
2. Press keys shown in the menu to navigate or execute commands
3. Press `Esc` to close the menu

### Major Mode (App-Specific)

Major mode provides context-aware keymaps based on the currently focused application.

1. Press `Ctrl+Option+,` to open major mode menu
2. The menu shows commands specific to the active application
3. Create app-specific layers in `~/.config/yawhich-key/layers/`

Example major mode layer (`~/.config/yawhich-key/layers/vscode.yaml`):

```yaml
name: vscode.yaml

# This layer is active when VSCode is focused
window_class:
  - com.microsoft.VSCode

keymaps:
  +file:
    +save: osascript -e 'tell application "System Events" to keystroke "s" using command down'
    +new: osascript -e 'tell application "System Events" to keystroke "n" using command down'
  +search:
    +find: osascript -e 'tell application "System Events" to keystroke "f" using command down'
    +files: osascript -e 'tell application "System Events" to keystroke "p" using command down'
```

To find the bundle ID of an application on macOS:

```bash
osascript -e 'id of app "Application Name"'
# Example: osascript -e 'id of app "Visual Studio Code"'
# Returns: com.microsoft.VSCode
```

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
