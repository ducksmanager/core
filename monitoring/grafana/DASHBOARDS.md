# Dashboards

Two mechanisms coexist in this stack:

| Dashboard | Managed by | Where it lives |
| --- | --- | --- |
| `ducksmanager-overview` | **gcx** (as code) | `resources/dashboards/dm-overview.json` |
| `cadvisor`, `node-exporter-full` | Grafana **file provisioning** | `dashboards/*.json` |

`ducksmanager-overview` is the one we hand-edit, so it uses [gcx](https://github.com/grafana/gcx)
to get an *edit-in-UI → see-the-diff → commit* loop. The other two are static
upstream community dashboards, so plain file provisioning is simpler.

## The editing loop

1. Edit `DucksManager Overview` in the Grafana UI and **Save**.
2. Pull the live state back into the repo:
   ```sh
   cd monitoring/grafana
   GRAFANA_SERVER=https://grafana.ducksmanager.net GRAFANA_TOKEN=<sa-token> pnpm dashboards:pull
   ```
3. `git diff resources/` shows exactly what changed → commit.
4. On the next push to `master` touching `monitoring/grafana/**`, the
   `deploy-monitoring` workflow runs `gcx resources push`, so the committed
   file becomes the source of truth again.

Preview what a push *would* change without applying it:
```sh
pnpm dashboards:diff   # gcx resources push ... --dry-run
```

## Authentication

gcx reads a single context from env vars (best for CI and one-off commands):

| Var | Value |
| --- | --- |
| `GRAFANA_SERVER` | `https://grafana.ducksmanager.net` (or `http://localhost:3000` in dev) |
| `GRAFANA_TOKEN` | a Grafana **service-account token** with the **Editor** role |
| `GRAFANA_ORG_ID` | `1` (OSS single-org) |

Create the token in Grafana under *Administration → Service accounts*. In CI it
comes from the `MONITORING_GRAFANA_SA_TOKEN` GitHub Actions secret (environment
`production`). Alternatively, `gcx login` stores contexts in
`~/.config/gcx/config.yaml` for interactive local use.

## One-time bootstrap

The `resources/dashboards/dm-overview.json` manifest was generated from the old
provisioned JSON, so the repo is already pushable. To make it byte-identical to
what gcx emits (and guarantee clean future diffs), once the toggle-enabled
Grafana is deployed:

```sh
cd monitoring/grafana
export GRAFANA_SERVER=https://grafana.ducksmanager.net GRAFANA_TOKEN=<sa-token> GRAFANA_ORG_ID=1
pnpm dashboards:push    # push the bootstrap manifest
pnpm dashboards:pull    # re-pull the canonical form
git diff resources/     # commit any normalization
```

## Requirements

- Grafana **12+** with the `kubernetesDashboards` feature toggle (set in
  `grafana.ini`) — this exposes the `dashboard.grafana.app` API gcx uses.
- [gcx](https://github.com/grafana/gcx) on your PATH (currently *public preview*):
  ```sh
  brew install grafana/grafana/gcx
  # or: curl -fsSL https://raw.githubusercontent.com/grafana/gcx/main/scripts/install.sh | sh
  ```
  CI installs it via the same official script.

## Folder note

The gcx-managed dashboard currently lands in Grafana's **General** folder (the
manifest has no folder reference), whereas file provisioning put everything in a
`DucksManager` folder. To restore the folder, add a `Folder` manifest under
`resources/` and set `spec.folderUID` (Grafana pushes folders before dashboards).
