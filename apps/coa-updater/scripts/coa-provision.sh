#!/usr/bin/env bash

if ! mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e ";" ; then
    echo "Can't connect to the '${MYSQL_DATABASE}' DB, exiting"
    exit 1
fi

echo "OK"
exit 0

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

perl -0777 -i -pe 's%KEY pk0%CONSTRAINT `PRIMARY` PRIMARY KEY%gms' ${inducks_path}/createtables_clean.sql # Replace "pk0" indexes with actual primary keys
for i in $(seq 0 5);
do
  perl -0777 -i -pe 's%(CREATE TABLE ((?:(?!_temp).)+?)_temp(?:(?!KEY fk'${i}')[^;])+?)KEY (fk)('${i}')%$1KEY $3_$2$4%gms' ${inducks_path}/createtables_clean.sql # Prefix foreign key names with table names
done

perl -0777 -i -pe 's%(ALTER TABLE )(([^ ]+)_temp)( ADD FULLTEXT)(\([^()]+\));%$1$2$4 fulltext_$3 $5;%gs' ${inducks_path}/createtables_clean.sql # Prefix fulltext indexes with table name

mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} -v --default_character_set utf8 ${MYSQL_DATABASE} --local_infile=1 < ${inducks_path}/createtables_clean.sql

mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} information_schema -Nse "SELECT c.TABLE_NAME, c.COLUMN_NAME FROM columns c INNER JOIN statistics s ON s.TABLE_NAME = c.TABLE_NAME AND s.COLUMN_NAME = c.COLUMN_NAME WHERE c.TABLE_SCHEMA = '${MYSQL_DATABASE}' AND c.DATA_TYPE='text'" | \
while read table_name column_name; do
  echo "Converting $table_name.$column_name from text to varchar..."
  get_column_max_length_query="select max(length($column_name)) from $table_name"
  max_length=`mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -Nse "$get_column_max_length_query"`
  mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e "ALTER TABLE $table_name MODIFY COLUMN $column_name varchar($max_length)"
  echo "Converted $table_name.$column_name from text to varchar($max_length)"
done
