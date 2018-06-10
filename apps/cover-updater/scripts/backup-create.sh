#!/usr/bin/env bash

pastec_download_dir=/tmp/
backup_date=`date +%Y-%m-%d`
pastec_backupfile=${pastec_backupfile}

curl -X POST -d '{"type":"WRITE", "index_path":"docker_index_'${backup_date}'.dat"}' \
     http://${PASTEC_HOST}:${PASTEC_PORT}/index/io && \
docker cp ${PASTEC_HOST}:${PASTEC_CONTAINER_HOME}docker_index_${backup_date}.dat \
          ${pastec_download_dir} && \
\
7z a -m0=lzma2 ${pastec_backupfile}.7z \
               ${pastec_backupfile} && \
scp ${pastec_backupfile}.7z \
    ${BACKUP_SERVER_CONNECTION_STRING} && \
rm ${pastec_backupfile}*
