#!/usr/bin/env bash
if [ ! "$BASH_VERSION" ] ; then
    echo "Please do not use sh to run this script ($0), just execute it directly or use bash" 1>&2
    exit 1
fi

set -e
set -u
# set -x

file="$1"

layer_name=$( basename "$file" .yaml)

# yq r -j $file

new_layer=$( cat <<EOF
name: $layer_name

# Which window class with it match against
# window_class: any(list(str()), str())

# dependencies: list(include('dependency', required=False))

keymaps:

EOF
)

is_command=1
  command=
  name=
 while read -r line; do
  if [[ $is_command == 1 ]]; then
    command=$line
    is_command=0
  else
    name=$(echo $line | sed 's/ /-/g' )
    is_command=1
    new_layer="$new_layer
    $name: $command
    "
  fi
done < <(yq r --printMode v "$1" '.*') 

echo "$new_layer"
