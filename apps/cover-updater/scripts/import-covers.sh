#!/usr/bin/env bash

COVER_LIST_EXPORT_FILE=/home/covers.csv

echo "Exporting covers from the COA database..."
mysql -h ${MYSQL_COA_HOST} -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_COA_DATABASE} </home/scripts/sql/get-coa-covers.sql | sed 's/\t/,/g' >${COVER_LIST_EXPORT_FILE} &&
    echo "Importing covers into the covers database..." &&
    mysql -uroot -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_COVER_INFO_HOST} --local-infile=1 ${MYSQL_COVER_INFO_DATABASE} -e "LOAD DATA LOCAL INFILE \"${COVER_LIST_EXPORT_FILE}\" IGNORE INTO TABLE covers FIELDS TERMINATED BY ',' IGNORE 1 LINES (issuecode,sitecode,url)"
