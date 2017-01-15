#!/usr/bin/env bash

. /home/container.properties

inducks_path=/home/inducks
isv_path=$inducks_path/isv

rm -rf ${inducks_path}
mkdir -p ${isv_path}

cd ${inducks_path}

wget http://coa.inducks.org/inducks/isv.7z && 7zr x isv.7z && rm isv.7z

# Ignore lines with invalid UTF-8 characters
for f in ${isv_path}/*.isv; do
     iconv -f utf-8 -t utf-8 -c "$f" > "$f.clean" \
  && mv -f "$f.clean" "$f"
done
mv ${isv_path}/createtables.sql ${inducks_path}

cp ${inducks_path}/createtables.sql ${inducks_path}/createtables_clean.sql

perl -0777 -i -pe 's%(CREATE TABLE (?:IF NOT EXISTS )?induckspriv[^;]+;)|([^\n]*induckspriv[^\n]*)%%gms' ${inducks_path}/createtables_clean.sql # Remove mentions of inducks_priv* tables
perl -0777 -i -pe 's%(# End of file)$%ALTER TABLE inducks_entry ADD FULLTEXT INDEX entryTitleFullText(title);\n\n\1%gms' ${inducks_path}/createtables_clean.sql # Add full text index on entry titles

mysql --user=root --password=${DB_PASSWORD} -e 'CREATE DATABASE IF NOT EXISTS `coa` /*!40100 DEFAULT CHARACTER SET utf8 */;'

mysql --user=root --password=${DB_PASSWORD} -v --default_character_set utf8 coa --local_infile=1 < ${inducks_path}/createtables_clean.sql
