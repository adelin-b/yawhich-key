# NPM Scripts Guide

This document describes all available npm scripts for development, building, and releasing yawhich-key.

## Development

### `bun run dev`
Start the Tauri app in development mode with hot reload.

```bash
bun run dev
```

This will:
- Start the Vite dev server
- Launch the Tauri app
- Enable hot module replacement (HMR)
- Open DevTools

## Building

### `bun run build`
Build the frontend only (TypeScript + Vite).

```bash
bun run build
```

### `bun run tauri:build`
Build the complete Tauri application (default bundles).

```bash
bun run tauri:build
```

### `bun run tauri:build:app`
Build only the .app bundle (no DMG).

```bash
bun run tauri:build:app
```

Output: `src-tauri/target/release/bundle/macos/yawhich-key.app`

### `bun run tauri:build:dmg`
Build only the DMG installer.

```bash
bun run tauri:build:dmg
```

Note: This may fail - use `tauri:build:app` + `bundle:dmg` instead.

### `bun run tauri:build:all`
Build both .app and DMG in one command.

```bash
bun run tauri:build:all
```

### `bun run bundle:dmg`
Create a DMG from an existing .app bundle using create-dmg.

```bash
# First build the app
bun run tauri:build:app

# Then create DMG
bun run bundle:dmg
```

Output: `src-tauri/target/release/bundle/macos/yawhich-key_1.0.0_aarch64.dmg`

This script will also calculate and display the SHA256 checksum.

## Icons

### `bun run icon`
Generate all required icon sizes from a source PNG.

```bash
bun run icon src-tauri/icons/icon.png
```

This generates:
- macOS icns file
- Windows ico file
- Various PNG sizes
- iOS and Android icons

## Release Management

### `bun run release <version>`
Prepare a new release by updating version numbers across all files.

```bash
bun run release 1.0.1
```

This script:
1. Updates `package.json`
2. Updates `src-tauri/tauri.conf.json`
3. Updates `src-tauri/Cargo.toml`
4. Updates `Formula/yawhich-key.rb`
5. Shows next steps for completing the release

**Next steps after running this:**
```bash
# Build the app
bun run tauri:build:app

# Create DMG
bun run bundle:dmg

# Commit changes
git add .
git commit -m "chore: release v1.0.1"

# Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin tauri-rewrite
git push origin v1.0.1

# Create GitHub release and upload DMG
gh release create v1.0.1 \
  --title "v1.0.1" \
  --notes "Release notes here" \
  src-tauri/target/release/bundle/macos/yawhich-key_1.0.1_aarch64.dmg

# Update formula with SHA256 checksum
# (shown in bundle:dmg output)
```

## Complete Release Workflow

Here's the complete workflow for creating a new release:

```bash
# 1. Prepare release (updates all version numbers)
bun run release 1.0.1

# 2. Review changes
git diff

# 3. Build the application
bun run tauri:build:app

# 4. Create DMG and get checksum
bun run bundle:dmg
# Note the SHA256 checksum displayed

# 5. Update formula with checksum
# Edit Formula/yawhich-key.rb and replace PLACEHOLDER_SHA256_ARM64

# 6. Commit all changes
git add .
git commit -m "chore: release v1.0.1"

# 7. Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin tauri-rewrite
git push origin v1.0.1

# 8. Create GitHub release
gh release create v1.0.1 \
  --title "v1.0.1" \
  --notes "Release notes" \
  src-tauri/target/release/bundle/macos/yawhich-key_1.0.1_aarch64.dmg

# 9. Test Homebrew installation
brew uninstall yawhich-key || true
brew install adelin-b/yawhich-key/yawhich-key
```

## Automated Release (GitHub Actions)

When you push a tag starting with `v`, GitHub Actions will automatically:

1. Build the .app bundle
2. Create the DMG
3. Calculate checksums
4. Create a GitHub release
5. Upload the DMG as an artifact

To trigger:
```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

After the action completes:
1. Get the SHA256 from the release notes
2. Update `Formula/yawhich-key.rb`
3. Commit and push the formula update

## Troubleshooting

### "create-dmg not found"
```bash
brew install create-dmg
```

### ".app bundle not found"
Build it first:
```bash
bun run tauri:build:app
```

### "Failed to bundle project"
The Tauri DMG bundler sometimes fails. Use the two-step approach:
```bash
bun run tauri:build:app
bun run bundle:dmg
```

### DMG creation fails with "resource busy"
A volume might still be mounted:
```bash
hdiutil detach /Volumes/yawhich-key
bun run bundle:dmg
```

## File Locations

After building, files are located at:

- **Binary**: `src-tauri/target/release/yawhich-key`
- **.app Bundle**: `src-tauri/target/release/bundle/macos/yawhich-key.app`
- **DMG**: `src-tauri/target/release/bundle/macos/yawhich-key_1.0.0_aarch64.dmg`
- **Icons**: `src-tauri/icons/`

## CI/CD

The `.github/workflows/release.yml` workflow handles releases automatically.

To add new platforms or bundle types, edit:
- `src-tauri/tauri.conf.json` - `bundle.targets`
- `.github/workflows/release.yml` - `matrix.platform`
