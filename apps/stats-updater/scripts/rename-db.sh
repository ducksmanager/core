#!/bin/sh

sql_dir=/home/scripts/sql/

mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST} < ${sql_dir}ddl/rename-db.sql
