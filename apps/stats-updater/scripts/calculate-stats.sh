#!/bin/sh

sh_dir=/home/scripts
export_dir=${sh_dir}/export
coa_results_dir=${sh_dir}/coa_results
export_page=http://www.ducksmanager.net/remote/generer_csv_pour_export.php

mkdir -p ${export_dir}
mkdir -p ${coa_results_dir}

# Import user author preferences and data from DM
# TODO Use the local DM copy DB
wget "${export_page}?mdp=${DUCKSMANAGER_SECURITY_PASSWORD}&csv=numeros"         -O ${export_dir}/numeros_simple.csv
wget "${export_page}?mdp=${DUCKSMANAGER_SECURITY_PASSWORD}&csv=auteurs_pseudos" -O ${export_dir}/auteurs_pseudos_simple.csv

cd ${sh_dir}

# Import DM data to the local dm_stats_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new < ${sh_dir}/sql/0_load-users-authors.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new < ${sh_dir}/sql/0_load-users-issues.sql

# Import DM data to the dm_stats_new DB on the COA server
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} dm_stats_new < ${sh_dir}/sql/0_load-users-authors.sql

# Get COA-related information
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} ${MYSQL_COA_DATABASE} -s < ${sh_dir}/sql/1_coa-get-stories-publications.sql > ${coa_results_dir}/histoires_publications.csv 2>&1
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} ${MYSQL_COA_DATABASE} -s < ${sh_dir}/sql/2_coa-get-authors-stories.sql      > ${coa_results_dir}/auteurs_histoires.csv 2>&1

# Insert the data calculated from the COA database into the local dm_stats_new DB
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new -e "LOAD DATA LOW_PRIORITY LOCAL INFILE '${coa_results_dir}/histoires_publications.csv' INTO TABLE dm_stats_new.histoires_publications; SHOW WARNINGS;"
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new -e "LOAD DATA LOW_PRIORITY LOCAL INFILE '${coa_results_dir}/auteurs_histoires.csv' INTO TABLE dm_stats_new.auteurs_histoires; SHOW WARNINGS;"

# Calculate the statistics locally
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new < ${sh_dir}/sql/3_calculate-stats.sql
