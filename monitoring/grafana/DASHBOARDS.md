# Dashboards

All dashboards are managed by Grafana **file provisioning**: the JSON files in
`dashboards/` are baked into the image (`Dockerfile`) and provisioned from
`/etc/grafana/dashboards` (see `provisioning/dashboards/dashboards.yaml`). On
every deploy the committed files are the source of truth.

| Dashboard                        | Notes                                             |
| -------------------------------- | ------------------------------------------------- |
| `ducksmanager-overview`          | The one we hand-edit — has the editing loop below |
| `cadvisor`, `node-exporter-full` | Static upstream community dashboards              |

## The editing loop (ducksmanager-overview)

`allowUiUpdates: true` lets you edit in the UI; a small script pulls your changes
back into the repo so you can diff and commit them.

1. Edit `DucksManager Overview` in the Grafana UI and **Save**.
2. Pull the live state back into the repo:
   ```sh
   cd monitoring/grafana
   # dev (localhost:3000, admin/admin) — nothing to set:
   pnpm dashboards:pull
   # prod:
   GRAFANA_URL=https://grafana.ducksmanager.net GRAFANA_TOKEN=<sa-token> pnpm dashboards:pull
   ```
3. `git diff dashboards/ducksmanager-overview.json` shows exactly what changed → commit.
4. The next push to `master` touching `monitoring/grafana/**` triggers
   `deploy-monitoring`, which rebuilds the image and re-provisions the file — so
   the commit wins over any lingering UI state.

The pull script (`bin/dashboards-pull.sh`) uses Grafana's classic API
(`GET /api/dashboards/uid/dm-overview`), strips the DB-local `id` and the
UI save-counter `version`, and sorts keys so diffs stay clean.

## Auth for the pull script

| Var             | Value                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| `GRAFANA_URL`   | `https://grafana.ducksmanager.net` (prod) or `http://localhost:3000` (dev, default) |
| `GRAFANA_TOKEN` | a Grafana **service-account token** (Editor role) — Bearer auth                     |
| `GRAFANA_AUTH`  | alternative `user:password` basic auth (default `admin:admin` for dev)              |

Only the pull step needs credentials, and only when pulling from prod. Deploys
provision the committed files directly — no token required in CI.

## Note

The first `pnpm dashboards:pull` will produce a large one-time diff: Grafana's
API returns the full ("fat") dashboard model with every panel default filled in,
replacing the minimal hand-written JSON. After that first commit, diffs are
clean and meaningful.
