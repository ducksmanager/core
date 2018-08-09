#!/bin/sh

sql_dir=/home/scripts/sql/

# Create local database dm_stats_new
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} < ${sql_dir}ddl/create-db.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new < ${sql_dir}ddl/derived-from-dm/auteurs_pseudos_simple.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new < ${sql_dir}ddl/derived-from-dm/numeros_simple.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} dm_stats_new < ${sql_dir}ddl/create-stats-tables.sql

# Temporarily re-create auteurs_pseudos_simple in the COA server (new DB) to perform stats operations
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} < ${sql_dir}/ddl/create-db.sql
mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_COA_HOST} < ${sql_dir}/ddl/derived-from-dm/auteurs_pseudos_simple.sql
