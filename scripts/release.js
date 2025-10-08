#!/usr/bin/env node

/**
 * Release helper script
 * Usage: bun run release [version]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const args = process.argv.slice(2);
const newVersion = args[0];

if (!newVersion) {
  console.error('Usage: bun run release <version>');
  console.error('Example: bun run release 1.0.1');
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Error: Version must be in format X.Y.Z (e.g., 1.0.1)');
  process.exit(1);
}

console.log(`🚀 Preparing release v${newVersion}`);

// Update package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

// Update tauri.conf.json
const tauriConfPath = join(rootDir, 'src-tauri/tauri.conf.json');
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = newVersion;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✅ Updated tauri.conf.json');

// Update Cargo.toml
const cargoTomlPath = join(rootDir, 'src-tauri/Cargo.toml');
let cargoToml = readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
writeFileSync(cargoTomlPath, cargoToml);
console.log('✅ Updated Cargo.toml');

// Update Homebrew formula
const formulaPath = join(rootDir, 'Formula/yawhich-key.rb');
let formula = readFileSync(formulaPath, 'utf8');
formula = formula.replace(/version "\d+\.\d+\.\d+"/, `version "${newVersion}"`);
writeFileSync(formulaPath, formula);
console.log('✅ Updated Formula/yawhich-key.rb');

console.log('\n📝 Next steps:');
console.log('1. Review changes: git diff');
console.log('2. Build release: bun run tauri:build:app');
console.log('3. Create DMG: bun run bundle:dmg');
console.log('4. Commit: git add . && git commit -m "chore: release v' + newVersion + '"');
console.log('5. Tag: git tag -a v' + newVersion + ' -m "Release v' + newVersion + '"');
console.log('6. Push: git push origin tauri-rewrite && git push origin v' + newVersion);
console.log('7. Create GitHub release with the DMG');
console.log('8. Update formula with SHA256 from DMG');
