#!/usr/bin/env bash
set -euo pipefail

# Pull the live "DucksManager Overview" dashboard from a running Grafana via the
# classic HTTP API and write it back to the provisioned file, so `git diff`
# shows exactly what your UI edits changed.
#
# Workflow: edit in the Grafana UI -> run this -> `git diff` -> commit -> deploy
# (the file is provisioned into the image, so the commit becomes the source of
# truth on the next deploy).
#
# Env vars:
#   GRAFANA_URL    Base URL of the Grafana to pull from.
#                  Default http://localhost:3000 (the dev compose).
#                  For prod: https://grafana.ducksmanager.net
#   GRAFANA_TOKEN  Service-account token (Bearer). Takes precedence if set.
#   GRAFANA_AUTH   "user:password" basic auth. Default admin:admin (dev).

GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
DASHBOARD_UID="dm-overview"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${SCRIPT_DIR}/../dashboards/ducksmanager-overview.json"

if [[ -n "${GRAFANA_TOKEN:-}" ]]; then
  auth=(-H "Authorization: Bearer ${GRAFANA_TOKEN}")
else
  auth=(-u "${GRAFANA_AUTH:-admin:admin}")
fi

# The classic API wraps the model in { dashboard, meta }. Keep only .dashboard,
# drop the DB-local `id` and the UI save-counter `version` so diffs stay clean
# and portable; sort keys (-S) so re-exports produce stable, minimal diffs.
curl -fsSL "${auth[@]}" "${GRAFANA_URL}/api/dashboards/uid/${DASHBOARD_UID}" \
  | jq -S '.dashboard | del(.id, .version)' \
  > "${OUT}.tmp"
mv "${OUT}.tmp" "${OUT}"

echo "Wrote ${OUT}"
echo "Review with:  git diff -- ${OUT#"$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)/"}"
