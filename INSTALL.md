# Installation Guide

## Option 1: Homebrew (Recommended)

### Install from tap

```bash
brew tap adelin-b/yawhich-key
brew install yawhich-key
```

### Or install directly

```bash
brew install adelin-b/yawhich-key/yawhich-key
```

## Option 2: DMG Installer

1. Download the latest DMG from [Releases](https://github.com/adelin-b/yawhich-key/releases)
2. Open the DMG file
3. Drag `yawhich-key.app` to your Applications folder
4. (Optional) Create a symlink for command-line access:
   ```bash
   ln -s /Applications/yawhich-key.app/Contents/MacOS/yawhich-key /usr/local/bin/yawhich-key
   ```

## Option 3: Build from Source

### Prerequisites

- Rust (via rustup)
- Node.js and Bun
- Xcode Command Line Tools

### Build steps

```bash
# Clone the repository
git clone https://github.com/adelin-b/yawhich-key.git
cd yawhich-key

# Install dependencies
bun install

# Build the .app bundle
bun run tauri:build:app

# Create the DMG installer
bun run bundle:dmg

# The .app will be at: src-tauri/target/release/bundle/macos/yawhich-key.app
# The DMG will be at: src-tauri/target/release/bundle/macos/yawhich-key_1.0.0_aarch64.dmg
```

For more build options, see [SCRIPTS.md](SCRIPTS.md).

## Post-Installation

After installing, configure your keybindings at:
```
~/.config/yawhich-key/
```

See the [README](README.md) for configuration details.

## Uninstallation

### Homebrew
```bash
brew uninstall yawhich-key
brew untap adelin-b/yawhich-key
```

### Manual
```bash
rm -rf /Applications/yawhich-key.app
rm /usr/local/bin/yawhich-key
rm -rf ~/.config/yawhich-key
```
