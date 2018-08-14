#!/bin/sh

mkdir -p ${csv_results}

cd /home/scripts/sql

# Get user-related information from the DM DB
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_HOST} -s ${MYSQL_DM_DATABASE} < 0_dm-get-user-issues.sql \
  > ${csv_results}/dm-users-issues.csv 2>&1
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_HOST} -s ${MYSQL_DM_DATABASE} < 0_dm-get-users-authors.sql \
  > ${csv_results}/dm-users-authors.csv 2>&1


# Import DM data to the local ${MYSQL_DM_STATS_DATABASE}_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 0_load-users-authors.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 0_load-users-issues.sql

# Import DM data to the ${MYSQL_DM_STATS_DATABASE}_new DB on the COA server
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 0_load-users-authors.sql


# Get COA-related information
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} -s ${MYSQL_COA_DATABASE} < 1_coa-get-stories-publications.sql \
  > ${csv_results}/histoires_publications.csv 2>&1

mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} -s ${MYSQL_COA_DATABASE} < 2_coa-get-authors-stories.sql \
  > ${csv_results}/auteurs_histoires.csv 2>&1

# Insert the data calculated from the COA database into the local ${MYSQL_DM_STATS_DATABASE}_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 3_dm_stats-store-stories-publications.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 4_dm_stats-store-authors-stories.sql


# Calculate the statistics
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 5_calculate-stats.sql
