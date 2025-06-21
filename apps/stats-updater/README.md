# DM stats

Daily stats calculation for DucksManager

### Provisioning

Provisioning is executed when the container starts.

Required environment variables :

- `DATABASE_URL_DM_STATS` : The connection string to the temporary DM stats DB
- `DATABASE_NAME_COA` : The name of the coa schema
- `DATABASE_NAME_DM_STATS` : The name of the DM stats schema
- `DM_STATS_DDL_PATH` : The path to a file containing the DDL for the DM stats DB
