# duck-cover-id

Store cover info from a COA database and process them through Pastec.

### Requirements

- An accessible COA database (see [schema](/packages/prisma-schemas/schemas/coa/migrations/0_init/migration.sql))
- A running [pastec](https://github.com/Visu4link/pastec) instance : `docker run --restart always -d --name pastec bperel/pastec-ubuntu-1704-timestamps`

### Execution

The COA database and Pastec need to be accessible to make the importation and the processing of the covers work.

When created, the container runs the following steps :

- Import the covers from a COA database and store them into a Covers database (takes a few minutes)
- Record, as already imported, the covers that the Pastec index already holds
- Delete the covers that are no longer in the Pastec index
- Process the covers (takes ~ 0.1 second per cover), until `MAX_PROCESS_MINUTES` is up
- Ask the first Pastec instance to write its index to disk, if any cover was imported.

```bash
docker compose run --rm cover-updater
```

### Environment

`MYSQL_ROOT_PASSWORD`, `MYSQL_COA_HOST`, `MYSQL_COA_DATABASE`, `MYSQL_COVER_INFO_HOST`,
`MYSQL_COVER_INFO_DATABASE` and `PASTEC_HOSTS_AND_PORTS` are required.

`MAX_DELETE_PERCENT` is optional and defaults to `10`: it caps the share of
`cover_imports` that a single cleanup may delete. Covers are only deleted when the
Pastec index could be read in full, so an unreachable or empty index skips the
cleanup rather than emptying the table. After a legitimate index rebuild the cap
can be raised for one run:

```bash
docker compose run --rm -e MAX_DELETE_PERCENT=60 cover-updater
```

`MAX_PROCESS_MINUTES` is optional and defaults to `15`: processing stops there and
resumes on the next run. It must stay comfortably below the timeout of the CI step
that starts the container, otherwise the run is killed before it can write the
index and the covers it imported are lost on the next Pastec restart.

`PASTEC_INDEX_PATH` is optional and defaults to `/pastec-index-last.dat`: the path
the Pastec instances are started with (`-i`), which is also where the first one is
asked to dump the index. That instance must mount it read-write.

### Pastec holds the index in memory

Covers added through `PUT /index/images/:id` only live in the instance's memory,
so the run ends with a `WRITE` to `/index/io`. Two things follow:

- Only the first instance of `PASTEC_HOSTS_AND_PORTS` mounts the index read-write
  and dumps it; the others boot from what it wrote.
- Re-adding a cover id the index already holds is a no-op for its size, since
  Pastec keys images by id. An index size that stays flat while the job reports
  thousands of imports a day means `cover_imports` has lost rows and the covers
  being "imported" are already indexed — which the backfill step now prevents.
