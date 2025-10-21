#!/bin/bash

echo "=== yawhich-key Debug Info ==="
echo ""

echo "1. Config directory exists:"
ls -la ~/.config/yawhich-key/

echo ""
echo "2. Core layer file:"
ls -la ~/.config/yawhich-key/layers/core.yaml

echo ""
echo "3. YAML syntax check (first 50 lines):"
head -50 ~/.config/yawhich-key/layers/core.yaml

echo ""
echo "4. Keymap count:"
grep -c "^  +" ~/.config/yawhich-key/layers/core.yaml

echo ""
echo "5. Running processes:"
ps aux | grep -i yawhich | grep -v grep

echo ""
echo "6. Test YAML parsing with Ruby:"
ruby -ryaml -e "YAML.load_file('$HOME/.config/yawhich-key/layers/core.yaml')" && echo "✓ YAML is valid" || echo "✗ YAML has errors"

echo ""
echo "7. Press Option+Ctrl+Space and check the terminal where 'bun run tauri dev' is running"
echo "   Look for [DEBUG] messages in the output"
