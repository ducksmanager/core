#!/usr/bin/env bash
# Staging name plus rename(2), so a half-built artifact is never served.
set -euo pipefail

target="${ARTIFACT_PATH:-/artifact/coa.sqlite}"
staging="$(dirname "$target")/.$(basename "$target").new"

rm -f "$staging"
bun bundle.mjs --out "$staging"
mv -f "$staging" "$target"
echo "published $target"
