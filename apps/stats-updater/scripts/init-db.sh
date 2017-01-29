#!/bin/sh

. /home/container.properties

sql_dir=/home/scripts/sql/

# Create local database dm_stats
mysql -v --user=root --password=${DB_PASSWORD} < ${sql_dir}ddl/create-db.sql
mysql -v --user=root --password=${DB_PASSWORD} < ${sql_dir}ddl/derived-from-dm/auteurs_pseudos_simple.sql
mysql -v --user=root --password=${DB_PASSWORD} < ${sql_dir}ddl/derived-from-dm/numeros_simple.sql
mysql -v --user=root --password=${DB_PASSWORD} < ${sql_dir}ddl/create-stats-tables.sql

# Temporarily re-create auteurs_pseudos_simple in the COA server (new DB) to perform stats operations
mysql -v --user=root --password=${COA_BOX_DB_PASSWORD} -h ${COA_BOX_HOST} < ${sql_dir}/ddl/create-db.sql
mysql -v --user=root --password=${COA_BOX_DB_PASSWORD} -h ${COA_BOX_HOST} < ${sql_dir}/ddl/derived-from-dm/auteurs_pseudos_simple.sql