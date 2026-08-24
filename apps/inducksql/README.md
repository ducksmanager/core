# inducksql

Exports the MariaDB `coa` schema to a read-only SQLite file, queried in the browser by
`@sqlite.org/sqlite-wasm` over HTTP range requests. MariaDB stays the source of truth; the
artifact is rebuilt from scratch and never written to at runtime.

### Usage

```bash
pnpm -F '~inducksql' export    # writes coa.sqlite
pnpm -F '~inducksql' verify    # diffs the artifact against the live schema
pnpm -F '~inducksql' test:vfs  # runs the range-request VFS against a real HTTP server
pnpm -F '~inducksql' dev       # viewer on :8009, serving coa.sqlite on :8901
```

`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_ROOT_PASSWORD` and `MYSQL_DATABASE` are required; see `.env`.

| flag             | default      | purpose                                           |
| ---------------- | ------------ | ------------------------------------------------- |
| `--out`          | `coa.sqlite` | output path                                       |
| `--page-size`    | `8192`       | SQLite page size                                  |
| `--only`         | _(all)_      | comma-separated table allowlist                   |
| `--no-indexes`   | off          | data only                                         |
| `--no-fts`       | off          | skip the FTS5 tables                              |
| `--journal-mode` | `delete`     | `wal` only if a consumer demands it (see Serving) |
| `--enum-checks`  | off          | emit `CHECK (col IN (...))` for enum columns      |

### Conversion rules

| MariaDB                                 | SQLite                                                        |
| --------------------------------------- | ------------------------------------------------------------- |
| `varchar`, `char`, `text`, `enum`       | `TEXT`                                                        |
| `int`, `tinyint`, `smallint`, `bigint`  | `INTEGER`                                                     |
| `float`, `double`, `decimal`            | `REAL`                                                        |
| `date`, `datetime`, `timestamp`, `time` | `TEXT`, ISO-8601                                              |
| single-column integer primary key       | `INTEGER PRIMARY KEY` (rowid alias)                           |
| text / composite primary key            | `PRIMARY KEY (...) WITHOUT ROWID` (except FTS5 source tables) |
| `FULLTEXT` index                        | FTS5 table `<table>_fts`                                      |
| `VECTOR` index                          | dropped                                                       |
| views                                   | not exported — only `BASE TABLE`s are read                    |
| row counts                              | recorded into `inducksql_stats`                               |

Excluded: `inducks_entryurl_vector` (needs `sqlite-vec`, and is most of the source size),
`temp_files_to_process_*`, `_prisma_migrations`, `induckspriv_*`, `inducks_issuequotation_raw`.

Most of the artifact is indexes, mostly the positional `fk*` ones. They look droppable but are
not: the joins they serve become full table scans, which over the VFS fetches whole tables. To
shrink the artifact, cut tables with `--only` instead.

`inducksql_stats` exists because `COUNT(*)` scans a table. `verify.ts` re-derives the counts, so
drift fails the build rather than showing a wrong number in the viewer.

### Differences from MariaDB

**Collation.** `coa` is `utf8mb3_unicode_ci`: case- and accent-insensitive, so
`'Frères' = 'Freres'` holds there. SQLite compares bytes, so `=`, `LIKE` and `ORDER BY` on text
all behave differently outside FTS5. Use `COLLATE NOCASE` for ASCII case-insensitivity, or a
normalised shadow column for accent-insensitive equality.

**Full-text search.** FTS5 with `unicode61 remove_diacritics 2` restores accent-insensitivity —
`noel` matches `Noël`. Ranking is BM25, so result order differs. `bm25()` only works where the
FTS table is queried directly; joining through it raises `unable to use function bm25 in the
requested context`, so wrap the match:

```sql
WITH m AS MATERIALIZED (
  SELECT rowid AS rid, bm25(inducks_entry_fts) AS bm
  FROM inducks_entry_fts WHERE inducks_entry_fts MATCH ? LIMIT 200
)
SELECT e.title FROM m JOIN inducks_entry e ON e.rowid = m.rid ORDER BY m.bm LIMIT 20;
```

**`inducks_entry` has no primary key** and some `entrycode` values are duplicated.

### Serving the artifact

`vfs/http-vfs.ts` reads the artifact over range requests, so the whole file is queryable without
downloading it — the VFSes bundled with sqlite-wasm all need it local first. `web/src/db.worker.ts`
is the reference use; it must be a Worker, since synchronous XHR is not permitted on the main
thread.

- The host must honour `Range` and return `206`. Caddy's `file_server` does; `vfs/range-server.ts`
  is the local equivalent.
- No whole-file `Content-Encoding`: ranges and compression do not compose.
- Keep `--journal-mode=delete`. A WAL database cannot be opened read-only at all — SQLite must
  create the `-shm` sidecar and fails with `SQLITE_CANTOPEN`.
- Serving cross-origin needs CORS to allow `Range` and expose `Content-Range`, since `Range` is
  not safelisted. Same-origin, as in production, avoids this.
- `blockSize` defaults to 16 KB. Raising it cuts requests only slightly while multiplying bytes,
  because b-tree descent issues dependent reads. Prefer HTTP/2 keep-alive.
- Cache with a versioned URL: under a stable name, a client mid-session across a rebuild can mix
  pages from two files and read it as corruption.

### Viewer

`web/` is a Vue 3 + Vite frontend over the VFS, against a fixed database rather than a file
picker (`VITE_DB_URL` to point it elsewhere). Sidebar of tables and views with row counts, schema
and DDL, a SQL editor (⌘/Ctrl+Enter), and a results grid. Running a query writes it to the `sql`
query parameter, and loading a URL carrying one runs it.

FTS5 tables, their shadow tables and `inducksql_stats` are hidden from the listing. Table
browsing is a bare `LIMIT 100` — no `COUNT(*)`, no `OFFSET`, both of which scan. Each query
reports its elapsed time, range requests and bytes, and `EXPLAIN QUERY PLAN` runs first so a
`SCAN` is flagged before it fetches a whole table.

### Deployment

Deployed on push to `master` by the repo's `deploy` workflow. Two images: `inducksql` (nginx
serving the built viewer) and `inducksql-exporter`. `Caddyfile` puts both behind
`inducksql.ducksmanager.net`, serving `/coa.sqlite` from `/server-data/inducksql` and proxying
the rest to the viewer.

Rebuilding the artifact is a separate batch step, not part of a deploy:

```bash
pnpm -F '~inducksql' prod:docker-compose-run
```

It writes into `/data/inducksql`, which is what Caddy serves.
