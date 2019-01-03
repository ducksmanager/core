# DM stats

Daily stats calculation for DucksManager

### Provisioning

Provisioning is executed when the container starts.

Required environment variables :
* `MYSQL_DM_STATS_HOST` : The hostname of the DM stats DB
* `MYSQL_DM_STATS_DATABASE` : The name of the DM stats DB
* `MYSQL_COA_HOST` : The hostname of the COA DB
* `MYSQL_COA_DATABASE` : The name of the COA DB
* `MYSQL_PASSWORD` : The password to access both databases
* `DUCKSMANAGER_SECURITY_PASSWORD` : The password that's required to download data from DucksManager
