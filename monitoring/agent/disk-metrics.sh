#!/bin/sh
# Emits free/total space for the /data volume as Prometheus textfile metrics.
# Runs as a sidecar next to the Alloy agent; it only mounts /out (= the
# /data/metrics directory, which lives on the /data volume), so it reads no host
# secrets. `df /out` reports the filesystem /data/metrics resides on, i.e. /data.
set -eu

OUT="${OUT_FILE:-/out/disk.prom}"
INTERVAL="${INTERVAL:-60}"
MOUNTPOINT="${MOUNTPOINT:-/data}"

emit() {
  # awk only extracts the KB columns (as strings) from the numeric data row --
  # the row is matched by $2 being all digits, which also skips a wrapped device
  # name. The KB->bytes multiply is done in the shell (64-bit) because busybox
  # awk formats integers as 32-bit and would overflow past ~2 GB.
  set -- $(df -k /out | awk '$2 ~ /^[0-9]+$/ { print $2, $4 }')
  size_kb="${1:-0}"
  avail_kb="${2:-0}"
  size=$(( size_kb * 1024 ))
  avail=$(( avail_kb * 1024 ))

  echo "# HELP node_filesystem_size_bytes Filesystem size in bytes (df sidecar)."
  echo "# TYPE node_filesystem_size_bytes gauge"
  printf 'node_filesystem_size_bytes{mountpoint="%s",device="data-volume",fstype="data"} %s\n' "$MOUNTPOINT" "$size"
  echo "# HELP node_filesystem_avail_bytes Filesystem space available in bytes (df sidecar)."
  echo "# TYPE node_filesystem_avail_bytes gauge"
  printf 'node_filesystem_avail_bytes{mountpoint="%s",device="data-volume",fstype="data"} %s\n' "$MOUNTPOINT" "$avail"
}

while true; do
  emit > "${OUT}.tmp"
  mv "${OUT}.tmp" "${OUT}"
  sleep "$INTERVAL"
done
