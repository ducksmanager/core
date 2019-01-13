#!/bin/sh

mkdir -p ${csv_results_dir}

cd /home/scripts/sql

# Import user author preferences and data from DM
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_HOST} -s ${MYSQL_DM_DATABASE} < 0_get-users-authors.sql \
  > ${csv_results_dir}/dm-users-authors.csv 2>&1
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_HOST} -s ${MYSQL_DM_DATABASE} < 0_get-users-issues.sql \
  > ${csv_results_dir}/dm-users-issues.csv 2>&1

# Import DM data to the local ${MYSQL_DM_STATS_DATABASE}_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 1_load-users-authors.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 1_load-users-issues.sql

# Import DM data to the ${MYSQL_DM_STATS_DATABASE}_new DB on the COA server
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 1_load-users-authors.sql


# Get COA-related information
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} -s ${MYSQL_COA_DATABASE} < 2_coa-get-stories-publications.sql \
  > ${csv_results_dir}/histoires_publications.csv 2>&1

mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} -s ${MYSQL_COA_DATABASE} < 3_coa-get-authors-stories.sql \
  > ${csv_results_dir}/auteurs_histoires.csv 2>&1

# Insert the data calculated from the COA database into the local ${MYSQL_DM_STATS_DATABASE}_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 4_dm_stats-store-stories-publications.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 5_dm_stats-store-authors-stories.sql


# Calculate the statistics locally
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 6_calculate-stats.sql
