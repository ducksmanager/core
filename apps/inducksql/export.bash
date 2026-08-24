#!/usr/bin/env bash
# Writes to a temporary name and renames, so Caddy never serves a half-built artifact:
# rename(2) within one filesystem is atomic and in-flight reads keep the old inode.
set -euo pipefail

target="${ARTIFACT_PATH:-/artifact/coa.sqlite}"
staging="$(dirname "$target")/.$(basename "$target").new"

rm -f "$staging"
bun bundle.mjs --out "$staging"
mv -f "$staging" "$target"
echo "published $target"
