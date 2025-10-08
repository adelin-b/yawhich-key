# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

yawhich-key is a macOS desktop application that displays available keybindings in a popup window, inspired by Emacs which-key. It's built with Tauri (Rust backend) + React (TypeScript frontend) for minimal resource usage and native performance.

## Architecture

### Hybrid Rust + React Stack
- **Backend (Rust)**: `src-tauri/src/main.rs` - Window management, shell command execution, keymap loading, macOS integration via Cocoa/Objective-C
- **Frontend (React)**: `src/App.tsx` and `src/components/WhichKeyMenu.tsx` - UI rendering, keyboard handling, animations (Framer Motion)
- **Configuration**: YAML-based keymaps stored in `~/.config/yawhich-key/layers/`

### Key Concepts

**1. Global vs Major Mode**
- Global mode: General keybindings accessible anywhere (triggered by Alt+Ctrl+Space)
- Major mode: App-specific keybindings based on focused app's bundle ID (triggered by Alt+Ctrl+,)
- Major mode layers are matched by `window_class` field containing bundle IDs

**2. Window Management Flow**
- Tauri window stays hidden in background (`visible: false` in config)
- Global shortcuts registered via `tauri-plugin-global-shortcut`
- On trigger: Rust backend captures focused window info BEFORE showing yawhich-key window
- Window auto-resizes based on keymap content (dynamic height calculation in `App.tsx`)
- Window positioned at bottom of screen, full width, transparent overlay
- On close: Focus restored to previously captured window via AppleScript

**3. Keymap Loading Strategy**
- Core layer: `~/.config/yawhich-key/layers/core.yaml` (general keybindings)
- App-specific layers: `~/.config/yawhich-key/layers/<AppName>.yaml` matched by bundle ID
- Keymaps validated for key conflicts in Rust (see `validate_keymaps_recursive`)
- Supports nested keymaps (prefix indicated by `+` in YAML)
- Default app placeholders: `<default:browser>`, `<default:terminal>`, `<default:editor>` resolved via macOS APIs

**4. Frontend State Management**
- Uses refs for performance-critical state (`visibleRef`, `keymapsRef`, `isShowingRef`)
- Event sequence counter prevents race conditions during rapid show/hide
- `ignoreBlurRef` prevents premature closing during window transitions
- Performance logging throughout for optimization (search for `console.log`)

## Development Commands

### Run dev server with hot reload
```bash
bun run dev
```

### Build frontend only (TypeScript + Vite)
```bash
bun run build
```

### Build complete Tauri app (.app bundle)
```bash
bun run tauri:build:app
```
Output: `src-tauri/target/release/bundle/macos/yawhich-key.app`

### Create DMG from existing .app
```bash
bun run bundle:dmg
```
Note: Install `create-dmg` first via `brew install create-dmg`

### Generate icons from source PNG
```bash
bun run icon src-tauri/icons/icon.png
```

## Release Process

### Prepare new release (updates all version numbers)
```bash
bun run release <version>
```
Updates: `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `Formula/yawhich-key.rb`

### Complete manual release workflow
```bash
bun run tauri:build:app          # Build .app
bun run bundle:dmg                # Create DMG + get SHA256
# Update Formula/yawhich-key.rb with SHA256
git add . && git commit -m "chore: release v<version>"
git tag -a v<version> -m "Release v<version>"
git push origin tauri-rewrite && git push origin v<version>
gh release create v<version> --title "v<version>" --notes "..." src-tauri/target/release/bundle/macos/*.dmg
```

### Automated release (GitHub Actions)
Push a tag starting with `v` to trigger `.github/workflows/release.yml`:
```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

## Configuration Files

### Keymap Layer Format (`~/.config/yawhich-key/layers/core.yaml`)
```yaml
name: Layer Name
window_class:           # Optional - for major mode
  - com.apple.Terminal
keymaps:
  +category:            # + prefix creates nested keymap
    +action: command    # First letter becomes hotkey
```

### Settings (`~/.config/yawhich-key/settings.yaml`)
```yaml
animations: true
theme: "custom-theme"   # Optional, loads from ~/.config/yawhich-key/themes/
```

### Custom Themes (`~/.config/yawhich-key/themes/<name>.css`)
Override CSS variables:
```css
:root {
  --bg-color: rgba(26, 26, 26, 0.95);
  --text-color: #e0e0e0;
  --accent-color: #ff0044;
}
```

## Important Implementation Details

### macOS Integration (Rust)
- Uses `cocoa` and `objc` crates for native macOS APIs
- `get_focused_app()`: Gets frontmost app's bundle ID via NSWorkspace
- `get_focused_window()`: Gets window title via AppleScript
- `focus_window()`: Restores focus to specific window by bundle ID + title
- `get_default_app()`: Resolves default browser/terminal/editor via Launch Services

### Performance Optimizations
- Window size calculated before showing to prevent flicker
- React state updates batched with refs for critical paths
- Framer Motion animations conditional on settings
- Event listeners cleaned up properly to prevent memory leaks
- Sequence counter prevents race conditions in async operations

### Special Features
- **Hydra Mode**: Press `H` to keep menu open after command execution
- **Search Mode**: Press `/` to fuzzy search all keymaps (flattened view)
- **Auto Template**: If major mode layer missing, creates template and opens in editor
- **Category Icons**: Auto-detects category from key names (apps 🚀, files 📁, git 🔀, etc.)

## Testing Configuration

Create test keymap:
```bash
mkdir -p ~/.config/yawhich-key/layers
cat > ~/.config/yawhich-key/layers/core.yaml << 'EOF'
name: Core
keymaps:
  +apps:
    +browser: open -a "Safari"
    +terminal: open -a "Terminal"
EOF
```

## Troubleshooting

### "No keymap configuration found"
Ensure `~/.config/yawhich-key/layers/core.yaml` exists with valid YAML

### Window not appearing
Check console for errors, verify global shortcuts not conflicting with system shortcuts

### Commands not executing
Verify shell commands work in terminal first, check permissions for AppleScript execution

### DMG creation fails
Use two-step approach: `bun run tauri:build:app` then `bun run bundle:dmg` instead of `tauri:build:dmg`
