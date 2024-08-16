# DM stats

Daily stats calculation for DucksManager

### Provisioning

Provisioning is executed when the container starts.

Required environment variables :

- `DATABASE_URL_COA` : The connection string to the COA DB
- `DATABASE_URL_DM` : The connection string to the DM DB
- `DATABASE_URL_DM_STATS` : The connection string to the DM stats DB
- `MYSQL_DM_STATS_DATABASE` : The name of the DM stats DB
- `MYSQL_HOST` : The hostname of the database
- `MYSQL_PASSWORD` : The password to the database
- `MYSQL_PORT` : The port to the database
