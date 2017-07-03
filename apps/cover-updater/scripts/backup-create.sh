#!/usr/bin/env bash

. container.properties

pastec_download_dir=/tmp/
backup_date=`date +%Y-%m-%d`

curl -X POST -d '{"type":"WRITE", "index_path":"docker_index_'${backup_date}'.dat"}' http://127.0.0.1:${PASTEC_CONTAINER_HOST_PORT}/index/io && \
docker cp ${PASTEC_CONTAINER_NAME}:${PASTEC_CONTAINER_HOME}docker_index_${backup_date}.dat ${pastec_download_dir} && \
\
7z a -m0=lzma2 ${pastec_download_dir}docker_index_${backup_date}.dat.7z ${pastec_download_dir}docker_index_${backup_date}.dat && \
scp ${pastec_download_dir}docker_index_${backup_date}.dat.7z ${BACKUP_SERVER_CONNECTION_STRING} && \
rm ${pastec_download_dir}docker_index_${backup_date}.dat*