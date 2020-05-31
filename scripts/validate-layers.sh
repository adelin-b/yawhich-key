#!/usr/bin/env bash
file="$1"

yamale -s ./tests/layer.schema.yaml "$file" --strict

# This steps will not be nessecary once https://github.com/23andMe/Yamale/issues/100 will be fixed
# Checking if there is a + in each key to indicate char to use
  yq r "$file" "keymaps." |\
  yq --printMode pv r - "**" --stripComments |\
  sed 's/\./\n/g' |\
  uniq |\
  grep -v 'transient' |\
  grep -v '+' && echo -e "\e[31m Nope 😡 Error\e[0m"
 
