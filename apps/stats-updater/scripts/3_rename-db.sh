#!/bin/sh

echo "DROP DATABASE IF EXISTS ${MYSQL_DM_STATS_DATABASE}_old;CREATE DATABASE ${MYSQL_DM_STATS_DATABASE}_old" \
  | mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST}

sql_dir=/home/scripts/sql/
tables=(\
  auteurs_histoires \
  auteurs_pseudos \
  histoires_publications \
  numeros_simple \
  utilisateurs_histoires_manquantes \
  utilisateurs_publications_manquantes \
  utilisateurs_publications_suggerees \
)

for table in "${tables[@]}"; do
  echo "RENAME TABLE ${MYSQL_DM_STATS_DATABASE}.$table     TO ${MYSQL_DM_STATS_DATABASE}_old.$table,
                     ${MYSQL_DM_STATS_DATABASE}_new.$table TO ${MYSQL_DM_STATS_DATABASE}.$table" \
    | mysql -v -uroot -p${MYSQL_PASSWORD} -h ${MYSQL_DM_STATS_HOST}
done
