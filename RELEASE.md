# Release Guide

This document describes how to create a new release of yawhich-key.

## Prerequisites

- Push access to the GitHub repository
- `gh` CLI tool installed and authenticated

## Release Process

### 1. Update Version

Update the version in these files:
- `src-tauri/tauri.conf.json` - `version` field
- `src-tauri/Cargo.toml` - `version` field
- `package.json` - `version` field
- `Formula/yawhich-key.rb` - `version` constant

### 2. Build Release Artifacts

```bash
# Clean previous builds
rm -rf src-tauri/target/release/bundle

# Build for current architecture
bun run tauri build --bundles app

# Create DMG
cd src-tauri/target/release/bundle/macos
create-dmg \
  --volname "yawhich-key" \
  --volicon "../../../../icons/icon.icns" \
  --window-pos 200 120 \
  --window-size 660 400 \
  --icon-size 100 \
  --icon "yawhich-key.app" 180 170 \
  --hide-extension "yawhich-key.app" \
  --app-drop-link 480 170 \
  "yawhich-key_1.0.0_aarch64.dmg" \
  "yawhich-key.app"
cd -
```

### 3. Calculate SHA256 Checksums

```bash
shasum -a 256 src-tauri/target/release/bundle/macos/yawhich-key_1.0.0_aarch64.dmg
```

Save this checksum for the formula update.

### 4. Create Git Tag

```bash
git add .
git commit -m "chore: release v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin tauri-rewrite
git push origin v1.0.0
```

### 5. Create GitHub Release

```bash
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "Release notes here" \
  src-tauri/target/release/bundle/macos/yawhich-key_1.0.0_aarch64.dmg
```

Or create the release manually on GitHub and upload the DMG.

### 6. Update Homebrew Formula

Update `Formula/yawhich-key.rb`:
- Replace `PLACEHOLDER_SHA256_ARM64` with the actual SHA256 checksum
- If you built for x86_64, update that checksum too

```bash
git add Formula/yawhich-key.rb
git commit -m "chore: update formula checksums for v1.0.0"
git push origin tauri-rewrite
```

### 7. Test Installation

```bash
# Uninstall if already installed
brew uninstall yawhich-key || true

# Install from your tap
brew tap adelin-b/yawhich-key
brew install yawhich-key

# Test
yawhich-key --version
```

## Automated Release (Future)

Consider using GitHub Actions to automate this process:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: |
          bun install
          bun run tauri build
      - name: Create DMG
        run: |
          # DMG creation steps
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/release/bundle/macos/*.dmg
```

## Formula Distribution

Users can install yawhich-key using:

```bash
# From your tap
brew tap adelin-b/yawhich-key
brew install yawhich-key

# Or directly
brew install adelin-b/yawhich-key/yawhich-key
```

To submit to homebrew-core (optional, requires more maintenance):
1. Fork homebrew-core
2. Add your formula to `Formula/`
3. Create a PR to homebrew/homebrew-core
