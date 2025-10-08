#!/usr/bin/env node

/**
 * Create DMG installer from .app bundle
 * Usage: bun run bundle:dmg
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version from package.json
const pkg = JSON.parse(
  execSync('cat package.json', { cwd: rootDir, encoding: 'utf8' })
);
const version = pkg.version;

// Determine architecture
const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';

// Paths
const appPath = join(rootDir, 'src-tauri/target/release/bundle/macos/yawhich-key.app');
const bundleDir = join(rootDir, 'src-tauri/target/release/bundle/macos');
const iconPath = join(rootDir, 'src-tauri/icons/icon.icns');
const dmgName = `yawhich-key_${version}_${arch}.dmg`;
const dmgPath = join(bundleDir, dmgName);

console.log('Creating DMG installer...');
console.log(`Version: ${version}`);
console.log(`Architecture: ${arch}`);
console.log(`Output: ${dmgPath}`);

// Check if .app exists
if (!existsSync(appPath)) {
  console.error(`Error: App bundle not found at ${appPath}`);
  console.error('Run "bun run tauri:build:app" first');
  process.exit(1);
}

// Check if create-dmg is installed
try {
  execSync('which create-dmg', { stdio: 'ignore' });
} catch (e) {
  console.error('Error: create-dmg not found');
  console.error('Install it with: brew install create-dmg');
  process.exit(1);
}

// Create DMG
const createDmgCmd = `
cd "${bundleDir}" && \
create-dmg \\
  --volname "yawhich-key" \\
  --volicon "${iconPath}" \\
  --window-pos 200 120 \\
  --window-size 660 400 \\
  --icon-size 100 \\
  --icon "yawhich-key.app" 180 170 \\
  --hide-extension "yawhich-key.app" \\
  --app-drop-link 480 170 \\
  "${dmgName}" \\
  "yawhich-key.app"
`;

try {
  execSync(createDmgCmd, { stdio: 'inherit' });
  console.log('\n✅ DMG created successfully!');
  console.log(`📦 Location: ${dmgPath}`);

  // Calculate checksum
  const checksum = execSync(`shasum -a 256 "${dmgPath}" | awk '{print $1}'`, {
    encoding: 'utf8'
  }).trim();

  console.log(`\n🔐 SHA256: ${checksum}`);
  console.log('\nUpdate Formula/yawhich-key.rb with this checksum.');
} catch (error) {
  console.error('Error creating DMG:', error.message);
  process.exit(1);
}
