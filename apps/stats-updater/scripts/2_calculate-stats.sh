#!/bin/sh

export_dir=/home/scripts/export
export_page=https://www.ducksmanager.net/remote/generer_csv_pour_export.php

mkdir -p ${export_dir}
mkdir -p ${coa_results_dir}

cd /home/scripts/sql

# Import user author preferences and data from DM
# TODO Use the local DM copy DB
wget "${export_page}?mdp=${DUCKSMANAGER_SECURITY_PASSWORD}&csv=numeros"         -O ${export_dir}/numeros_simple.csv
wget "${export_page}?mdp=${DUCKSMANAGER_SECURITY_PASSWORD}&csv=auteurs_pseudos" -O ${export_dir}/auteurs_pseudos_simple.csv

[ ! -f ${export_dir}/numeros_simple.csv ] && echo "Couldn't open ${export_dir}/numeros_simple.csv, exiting" && exit 1
[ ! -f ${export_dir}/auteurs_pseudos_simple.csv ] && echo "Couldn't open ${export_dir}/auteurs_pseudos_simple.csv, exiting" && exit 1

# Import DM data to the local ${MYSQL_DM_STATS_DATABASE}_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 0_load-users-authors.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 0_load-users-issues.sql

# Import DM data to the ${MYSQL_DM_STATS_DATABASE}_new DB on the COA server
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 0_load-users-authors.sql


# Get COA-related information
mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} -s ${MYSQL_COA_DATABASE} < 1_coa-get-stories-publications.sql \
  > ${coa_results_dir}/histoires_publications.csv 2>&1

mysql -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} -s ${MYSQL_COA_DATABASE} < 2_coa-get-authors-stories.sql \
  > ${coa_results_dir}/auteurs_histoires.csv 2>&1

# Insert the data calculated from the COA database into the local ${MYSQL_DM_STATS_DATABASE}_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 3_dm_stats-store-stories-publications.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 4_dm_stats-store-authors-stories.sql


# Calculate the statistics locally
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} ${MYSQL_DM_STATS_DATABASE}_new < 5_calculate-stats.sql
