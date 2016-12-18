#!/usr/bin/env bash

. /home/container.properties

COVER_LIST_EXPORT_FILE=/home/covers.csv

mysql --host=coa-box-1 -uroot -p$COA_DB_PASSWORD coa < /home/scripts/get-coa-covers.sql | sed 's/\t/,/g' > ${COVER_LIST_EXPORT_FILE}
mysql                  -uroot -p$DB_PASSWORD cover_info -e "LOAD DATA INFILE \"${COVER_LIST_EXPORT_FILE}\" IGNORE INTO TABLE covers FIELDS TERMINATED BY ',' IGNORE 1 LINES (issuecode,sitecode,url);"