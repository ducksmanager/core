#!/usr/bin/env bash

if ! mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e ";" ; then
    echo "Can't connect to the '${MYSQL_DATABASE}' DB, exiting"
    exit 1
fi

inducks_path=/home/inducks
isv_path=$inducks_path/isv
sql_clean_path=${inducks_path}/createtables_clean.sql

mkdir -p ${isv_path}
cd ${inducks_path}

wget -c https://coa.inducks.org/inducks/isv.tgz -O - | tar -xz

# Ignore lines with invalid UTF-8 characters
for f in ${isv_path}/*.isv; do
     iconv -f utf-8 -t utf-8 -c "$f" > "$f.clean" \
  && mv -f "$f.clean" "$f"
done
mv ${isv_path}/createtables.sql $sql_clean_path

perl -0777 -i -pe 's%(CREATE TABLE (?:IF NOT EXISTS )?induckspriv[^;]+;)|([^\n]*induckspriv[^\n]*)%%gms' $sql_clean_path # Remove mentions of inducks_priv* tables

perl -0777 -i -pe 's%# End of file%%gms' $sql_clean_path # Remove end-of-file comment

# Convert text columns to varchar
textFieldsToTransform=("inducks_person.fullname")
grep -Pon '\w+(?= text)' $sql_clean_path | while IFS=: read -r line field; do
  isv=$(tail -n+"$line" $sql_clean_path | grep -Po '(?<=LOAD DATA LOCAL INFILE "./isv/)[^"]+' | head -n1)
  table=$(echo "$isv" | grep -Po '[^.]+(?=\.)')
  if printf '%s\n' "${textFieldsToTransform[@]}" | grep -q -P '^'"$table"'.'"$field"'$'; then
    echo "Converting field $table.$field from text to varchar"
    echo " using data from $isv"
    max_field_length=$(sed 's/"/_/g' "./isv/$isv" | csvtool -t '^' namedcol "$field" - | tail -n+2 | wc -L)
    echo "Max field length=$max_field_length"
    sed -i "${line}s/$field text/$field varchar($max_field_length)/" $sql_clean_path
  else
    echo "Field $table.$field is not part of the list of fields to transform"
  fi
done

perl -0777 -i -pe 's%KEY pk0%CONSTRAINT `PRIMARY` PRIMARY KEY%gms' $sql_clean_path # Replace "pk0" indexes with actual primary keys
for i in $(seq 0 5);
do
  perl -0777 -i -pe 's%(CREATE TABLE ((?:(?!_temp).)+?)_temp(?:(?!KEY fk'${i}')[^;])+?)KEY (fk)('${i}')%$1KEY $3_$2$4%gms' $sql_clean_path # Prefix foreign key names with table names
done

perl -0777 -i -pe 's%(ALTER TABLE )(([^ ]+)_temp)( ADD FULLTEXT)(\([^()]+\));%$1$2$4 fulltext_$3 $5;%gs' $sql_clean_path # Prefix fulltext indexes with table name

echo "set unique_checks = 0;
set foreign_key_checks = 0;
set sql_log_bin=0;

$(<$sql_clean_path)

ALTER TABLE inducks_entryurl ADD id INT AUTO_INCREMENT NOT NULL, ADD PRIMARY KEY (id);

ALTER TABLE inducks_entry ADD FULLTEXT INDEX entryTitleFullText(title); # Add full text index on entry titles

set unique_checks = 1;
set foreign_key_checks = 1;
set sql_log_bin=1;
" > $sql_clean_path

mysql -h ${MYSQL_HOST} -uroot -p${MYSQL_PASSWORD} -v --default_character_set utf8 ${MYSQL_DATABASE} --local_infile=1 < $sql_clean_path
