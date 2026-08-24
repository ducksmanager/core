# inducksql

Exports the MariaDB `coa` schema to a single read-only SQLite file, for consumption by
`@sqlite.org/sqlite-wasm` in a separate project.

MariaDB stays the source of truth. Nothing here writes to it, and the generated file is never
written to at runtime — it is a build artifact, regenerated from scratch on each run.

### Usage

```bash
pnpm -F '~inducksql' export           # writes coa.sqlite
pnpm -F '~inducksql' verify           # diffs the artifact against the live schema
```

Required environment variables (see `.env`):

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_ROOT_PASSWORD` — connection to the `db` container
- `MYSQL_DATABASE` — the schema to export (`coa`)

Options:

| flag             | default      | purpose                                                        |
| ---------------- | ------------ | -------------------------------------------------------------- |
| `--out`          | `coa.sqlite` | output path                                                    |
| `--page-size`    | `8192`       | SQLite page size                                               |
| `--only`         | _(all)_      | comma-separated table allowlist, to produce a smaller artifact |
| `--no-indexes`   | off          | data only, no indexes (see below)                              |
| `--no-fts`       | off          | skip the FTS5 tables                                           |
| `--journal-mode` | `delete`     | leave as-is unless a consumer demands WAL (see below)          |
| `--enum-checks`  | off          | emit `CHECK (col IN (...))` for enum columns                   |

### What is excluded

`inducks_entryurl_vector` is dropped: it needs `sqlite-vec`, which the wasm build does not have,
and it accounts for most of the difference in size against the source schema. Also excluded are
the `temp_files_to_process_*` build residue, `_prisma_migrations`, the empty `induckspriv_*`
staging tables, and `inducks_issuequotation_raw` — so the `inducks_issuequotation` view over it
would have nothing to read even if views were exported.

A large share of the artifact is indexes, and the bulk of that is the positional `fk*` indexes. They
look droppable but are not: without them the join paths they serve become full table scans, which
on a range-request VFS means pulling whole tables over the network. If you need a smaller
artifact, cut whole tables with `--only` rather than dropping indexes.

### Conversion rules

| MariaDB                                 | SQLite                                                           |
| --------------------------------------- | ---------------------------------------------------------------- |
| `varchar`, `char`, `text`, `enum`       | `TEXT`                                                           |
| `int`, `tinyint`, `smallint`, `bigint`  | `INTEGER`                                                        |
| `float`, `double`, `decimal`            | `REAL`                                                           |
| `date`, `datetime`, `timestamp`, `time` | `TEXT`, ISO-8601 (sortable, accepted by SQLite's date functions) |
| single-column integer primary key       | `INTEGER PRIMARY KEY` (rowid alias, no extra index)              |
| text / composite primary key            | `PRIMARY KEY (...) WITHOUT ROWID` (except FTS5 source tables)    |
| `FULLTEXT` index                        | FTS5 table, see below                                            |
| `VECTOR` index                          | dropped                                                          |
| views                                   | **not exported** — only `BASE TABLE`s are read                   |
| row counts                              | recorded into `inducksql_stats` (see below)                      |

Views are excluded by construction. The ones in `coa` (`v_pool`, `v_sv`,
`inducks_issuequotation`) use `regexp` and `CAST(... AS UNSIGNED)` and would need rewriting to
run under SQLite; if the consumer needs them, define them client-side.

### Row counts

`COUNT(*)` scans a table — over a range-request VFS that means pulling it across the network — so
the exporter records each table's count into an `inducksql_stats(table_name, row_count)` table as
it loads. Reading every count costs about as much as reading the schema.

`verify.ts` re-derives the counts and fails on any drift, since a stale figure here would be
invisible in the viewer. The viewer hides `inducksql_stats` from its own listing.

### Behaviour that differs from MariaDB

**Collation.** `coa` is entirely `utf8mb3_unicode_ci`, which is case- _and_ accent-insensitive
(`'Frères' = 'Freres'` is true in MariaDB). SQLite compares bytes, and a large share of the titles are
accented, so any `=` or `LIKE` outside FTS5 will behave differently. Use `COLLATE NOCASE` for
ASCII case-insensitivity, or a normalised shadow column if you need accent-insensitive equality.

**`ORDER BY` on text.** Follows from the above — result order will differ from MariaDB for
accented values. `verify.ts` orders both sides with `BINARY` to compare them at all.

**Full-text search.** The `FULLTEXT` indexes become FTS5 tables named `<table>_fts`, tokenized
`unicode61 remove_diacritics 2`, which restores the accent-insensitivity that plain SQLite
comparisons lose — `noel` matches `Noël`, `freres` matches `frères`. Two caveats:

- Ranking is BM25, not MariaDB's, so **result ordering changes**.
- `bm25()` is only usable where the FTS table is queried directly. Joining through it raises
  `unable to use function bm25 in the requested context`; wrap the match in a materialized CTE:

```sql
WITH m AS MATERIALIZED (
  SELECT rowid AS rid, bm25(inducks_entry_fts) AS bm
  FROM inducks_entry_fts WHERE inducks_entry_fts MATCH ? LIMIT 200
)
SELECT e.title FROM m JOIN inducks_entry e ON e.rowid = m.rid ORDER BY m.bm LIMIT 20;
```

**No primary key on some tables.** `inducks_entry` has none in MariaDB, and some `entrycode`
values are duplicated. Do not assume `entrycode` is unique.

### Consuming it from `@sqlite.org/sqlite-wasm` + Vite

The pinned build (3.53.0) has `ENABLE_FTS5`, `ENABLE_RTREE`, `ENABLE_DBSTAT_VTAB` and
`MAX_DEFAULT_PAGE_SIZE=8192` — so FTS5 with the tokenizer above works, and the artifact's page
size matches the build's default.

`vfs/http-vfs.ts` is a read-only VFS that reads the artifact over HTTP **range requests**, so the
whole multi-gigabyte file is queryable without downloading it. The bundled VFSes (`memdb`,
`kvvfs`, `opfs`, `opfs-sahpool`) all need the database present locally first; this one does not.

An indexed lookup touches a handful of pages, so a query transfers a tiny fraction of the file.
`pnpm -F '~inducksql' test:vfs` runs representative queries against a real HTTP server, checks
the results against a local read, and reports the requests and bytes each one cost — run it if
you want current figures.

Repeating a query costs no requests at all, and index pages are reused across different
queries, so a session gets cheaper as it goes.

Usage — this must run in a Worker, because synchronous XHR is not permitted on the main thread:

```ts
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { installHttpVfs, createXhrSource } from "./http-vfs";

const sqlite3 = await sqlite3InitModule();
const source = createXhrSource("/coa.sqlite");
installHttpVfs(sqlite3, {
  resolve: (path) => (path.endsWith("coa.sqlite") ? source : null),
});
const db = new sqlite3.oo1.DB({
  filename: "coa.sqlite",
  flags: "r",
  vfs: "http",
});
```

`blockSize` defaults to 16 KB. Raising it helps less than it looks: b-tree descent issues
_dependent_ reads that read-ahead cannot predict, so larger blocks cut the request count only
slightly while multiplying the bytes transferred. Prefer HTTP/2 keep-alive over bigger blocks
for latency.

Serving requirements:

- The host must honour `Range` and return `206`. `vfs/range-server.ts` is a minimal reference
  implementation, and Caddy's `file_server` does this by default.
- The artifact **cannot** carry a whole-file `Content-Encoding` — ranges and compression do not
  compose. Serve it raw; only the requested ranges go over the wire.
- Keep `--journal-mode=delete` (the default). A WAL-mode database cannot be opened read-only at
  all: SQLite has to create the `-shm` sidecar and fails with `SQLITE_CANTOPEN`. Build with
  `--journal-mode=wal` only if some consumer requires it.
- Serve with a long-lived immutable `Cache-Control` and a versioned URL, so the browser keeps
  fetched ranges across sessions.

Vite needs the wasm asset left alone and the package excluded from dep optimization:

```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: { exclude: ["@sqlite.org/sqlite-wasm"] },
});
```

No COOP/COEP headers are required: the VFS uses synchronous XHR rather than
`SharedArrayBuffer`/`Atomics.wait`. If you would rather hold the database locally, `opfs-sahpool`
still works — fetch and decompress the artifact into OPFS once, noting that its importer
rewrites the header to force WAL off.

### Viewer

`web/` is a small Vue 3 + Vite frontend for inspecting the artifact through the range-request
VFS — a fixed database, not a file picker.

The sidebar lists tables and views with their row counts, read from `inducksql_stats`.

```bash
pnpm -F '~inducksql' dev:db    # serve coa.sqlite with Range support on :8901
pnpm -F '~inducksql' dev       # vite on :8009 + vue-tsc --watch
```

Point it elsewhere with `VITE_DB_URL`. It has a table/view sidebar with schema and DDL, a SQL
editor (⌘/Ctrl+Enter), and a results grid.

Running a query writes it to the `sql` query parameter, so a result can be shared as a link; a
page loaded with that parameter populates the editor and runs it. FTS5 tables, the shadow tables
each one creates, and `inducksql_stats` are all left out of the listing — they are found from the
virtual tables rather than matched by name, so the filter holds if `ftsIndexes` changes.

Two things it does deliberately, both because of how the VFS reads:

- **No row counts, no `OFFSET`.** `COUNT(*)` and deep pagination scan the table, which on a
  range-request VFS means pulling it across the network. Table browsing is a bare `LIMIT 100`.
- **It surfaces cost.** Every query reports elapsed time, range requests and KB fetched, with a
  running total in the header, and `EXPLAIN QUERY PLAN` runs first so a `SCAN` is flagged before
  it downloads a whole table.

Serving the artifact from another origin needs CORS: `Range` is not a safelisted header, so the
browser preflights and the server must allow `Range` and expose `Content-Range`.
`vfs/range-server.ts` does both.

### Deployment

Deployed on push to `master` by the repo's `deploy` workflow, which runs `build`,
`prod:build-docker`, `prod:transfer-files-post` and `prod:deploy` across changed packages. Two
images are built: `inducksql` (stock nginx serving the built viewer) and `inducksql-exporter`
(the export script). The image exists because it is how built assets reach the server —
`prod:transfer-files-*` moves individual config files, not directories of hashed bundles.

`Caddyfile` puts both behind `inducksql.ducksmanager.net`: `/coa.sqlite` is served straight off
disk from `/server-data/inducksql`, and everything else proxies to the viewer. Caddy's
`file_server` honours Range requests, so nothing extra is needed to serve the artifact — and
because it is the same origin as the app, CORS is not involved at all. Vite proxies the same path
to `range-server.ts` in development, so both environments look alike.

Refreshing the artifact is a separate batch step, not part of a deploy:

```bash
pnpm -F '~inducksql' prod:docker-compose-run
```

That runs the exporter against the `db` container and writes into `/data/inducksql`, which is the
directory Caddy serves. `export.bash` builds to a temporary name and renames, so a half-built
file is never served.

One caveat: because the artifact keeps a stable name, a client that is mid-session when a rebuild
lands can mix pages from the old and new files, which SQLite will read as corruption. Rebuilds
are infrequent and the window is small, but the robust fix is a content-versioned filename the
viewer discovers rather than hard-codes.

### Verification

`verify.ts` compares the artifact against the live schema and exits non-zero on any mismatch:
per-table row counts, a sampled value diff on `inducks_entry`, titles containing
newlines/tabs/quotes (what a naive CSV/TSV export silently drops), accented titles, `NULL` vs
`''` preservation, and the absence of views.
