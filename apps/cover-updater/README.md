# duck-cover-id

Store cover info from a COA database and process them through Pastec.

### Requirements

- An accessible COA database (see [schema](/packages/prisma-schemas/schemas/coa/migrations/0_init/migration.sql))
- A running [pastec](https://github.com/Visu4link/pastec) instance : `docker run --restart always -d --name pastec bperel/pastec-ubuntu-1704-timestamps`

### Execution

The COA database and Pastec need to be accessible to make the importation and the processing of the covers work.

When created, the container runs the following steps :

- Import the covers from a COA database and store them into a Covers database (takes a few minutes)
- Delete the covers that are no longer in the Pastec index
- Process the covers (takes ~ 0.1 second per cover).

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
