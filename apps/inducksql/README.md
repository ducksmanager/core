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
| `--no-indexes`   | off          | data only (halves the file, see below)                         |
| `--no-fts`       | off          | skip the FTS5 tables                                           |
| `--journal-mode` | `delete`     | set to `wal` only for `turso db upload` (see Serving)          |
| `--enum-checks`  | off          | emit `CHECK (col IN (...))` for the 55 enum columns            |

### Current output

78 tables, 14.6M rows, ~75s, **1784 MB** (`gzip` 466 MB, `zstd -19` 304 MB), `integrity_check: ok`.

`coa` is 4517 MB in MariaDB; most of the difference is excluded rather than compressed —
`inducks_entryurl_vector` (1490 MB, needs `sqlite-vec`, which the wasm build does not have),
three `temp_files_to_process_*` build-residue tables (442 MB), and `_prisma_migrations`.
Against the ~2585 MB of real payload it is a genuine ~1.5x reduction at equivalent indexing.

Roughly half the file is indexes (887 MB). Of that, ~510 MB is the 59 positional `fk*` indexes —
they look droppable but are not: without them the join paths they serve become full table scans
(`storycode -> publications` measured at 0.01 ms with them, 3689 ms without). If you need a
smaller artifact, cut whole tables with `--only` rather than indexes.

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

Views are excluded by construction. The three in `coa` (`v_pool`, `v_sv`,
`inducks_issuequotation`) use `regexp` and `CAST(... AS UNSIGNED)` and would need rewriting to
run under SQLite; if the consumer needs them, define them client-side.

### Behaviour that differs from MariaDB

**Collation.** `coa` is entirely `utf8mb3_unicode_ci`, which is case- _and_ accent-insensitive
(`'Frères' = 'Freres'` is true in MariaDB). SQLite compares bytes. There are 230,604 accented
titles, so any `=` or `LIKE` outside FTS5 will behave differently. Use `COLLATE NOCASE` for
ASCII case-insensitivity, or a normalised shadow column if you need accent-insensitive equality.

**`ORDER BY` on text.** Follows from the above — result order will differ from MariaDB for
accented values. `verify.ts` orders both sides with `BINARY` to compare them at all.

**Full-text search.** The 10 `FULLTEXT` indexes become FTS5 tables named `<table>_fts`, tokenized
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

**No primary key on some tables.** `inducks_entry` has none in MariaDB, and 128 `entrycode`
values are duplicated. Do not assume `entrycode` is unique.

### Consuming it from `@sqlite.org/sqlite-wasm` + Vite

The pinned build (3.53.0) has `ENABLE_FTS5`, `ENABLE_RTREE`, `ENABLE_DBSTAT_VTAB` and
`MAX_DEFAULT_PAGE_SIZE=8192` — so FTS5 with the tokenizer above works, and the artifact's page
size matches the build's default.

The VFSes it ships are `memdb`, `kvvfs`, `opfs` and `opfs-sahpool`. **There is no HTTP
range-request VFS**, so the file cannot be queried in place on the server — it has to be
present locally before the first query. That makes size the binding constraint:

- **`memdb` / `deserialize`** holds the whole database in wasm memory. 1784 MB is not viable in
  wasm32; this path needs an artifact trimmed with `--only` (target well under ~500 MB).
- **`opfs-sahpool`** is the option that scales. Fetch and decompress once into OPFS, then queries
  read only the pages they touch — every b-tree in the artifact is depth 4, so a point lookup is
  ~4 index + ~4 table pages ≈ 64 KB regardless of file size. Prefer it over `opfs`: it does not
  need `SharedArrayBuffer`, so no COOP/COEP headers. Request persistent storage
  (`navigator.storage.persist()`) before writing 1.8 GB, and expect the first-load download to be
  304 MB (`zstd`) or 466 MB (`gzip`).

Vite needs the wasm asset left alone and the package excluded from dep optimization:

```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: { exclude: ["@sqlite.org/sqlite-wasm"] },
  // Only needed for the `opfs` VFS; `opfs-sahpool` works without these.
  // server: { headers: { "Cross-Origin-Opener-Policy": "same-origin",
  //                      "Cross-Origin-Embedder-Policy": "require-corp" } },
});
```

Open the database read-only once it is in OPFS, and make sure your host serves the artifact with
`Content-Encoding` set so it is not decompressed twice.

### Serving: static file vs Turso

These are two different architectures, not two hosts for the same thing, and they need
differently-built artifacts.

**Static file + OPFS** (what the section above describes) keeps `@sqlite.org/sqlite-wasm`.
Queries run locally at 0.01–0.5 ms and work offline, at the cost of a one-time
160–304 MB download. Requires `--journal-mode=delete` (the default): a WAL-mode file
**cannot be opened read-only at all** — SQLite needs to create the `-shm` sidecar and fails with
`SQLITE_CANTOPEN`.

**Turso / a libSQL server** replaces sqlite-wasm with `@libsql/client` and queries over HTTP.
No download, but every query is a network round trip, and it needs `--journal-mode=wal` —
`turso db upload` rejects anything else with `Protocol error: upload works only for DBs with
journal_mode=WAL`. Two things to weigh:

- Turso bills **row reads**, so a query plan that degrades into a scan costs money rather than
  just latency: one full scan of `inducks_entry` is ~2M row reads, and the free tier is 500M/month.
  This is the other reason the `fk*` indexes have to stay.
- 1.78 GB fits the free tier's 5 GB storage, and no per-database cap is published — but confirm
  against current limits before committing.

Pruning does not rescue the download. A 15-table browse/search core is still 842 MB raw /
160 MB zstd, because `inducks_entry` (2.0M rows) and `inducks_storyjob` (2.1M rows) are
irreducible; adding `inducks_entryurl` takes it to 1316 MB / 208 MB.

### Verification

`verify.ts` compares the artifact against the live schema and exits non-zero on any mismatch:
per-table row counts, a 200k-row value diff on `inducks_entry`, titles containing
newlines/tabs/quotes (what a naive CSV/TSV export silently drops), accented titles, `NULL` vs
`''` preservation, and the absence of views.
