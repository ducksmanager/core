#!/bin/sh

. /home/container.properties

sql_dir=/home/scripts/sql/

mysql -v --user=root --password=${DB_PASSWORD} < ${sql_dir}ddl/rename-db.sql
