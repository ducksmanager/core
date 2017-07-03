#!/usr/bin/env bash

. container.properties

pastec_data_dir=/home/bperel/workspace/docker-pastec/
coverid_container=$1
backup_date=$2
backup_source_filename_unzipped="backup_dm-server-box_cover_info.sql"
backup_dest_dir=/home/bperel/backup/

docker cp ${pastec_data_dir}docker_index_${backup_date}.dat ${PASTEC_CONTAINER_NAME}:${PASTEC_CONTAINER_HOME} && \
curl -X POST -d '{"type":"LOAD", "index_path":"docker_index_'${backup_date}'.dat"}' http://127.0.0.1:${PASTEC_CONTAINER_HOST_PORT}/index/io && \
\
scp ${BACKUP_SERVER_CONNECTION_STRING}${backup_date}-${backup_source_filename_unzipped}.7z ${backup_dest_dir} && \
cd ${backup_dest_dir} && 7z e -y ${backup_date}-${backup_source_filename_unzipped}.7z && \
docker cp ${backup_source_filename_unzipped} ${coverid_container}:/tmp && \
docker exec -it ${coverid_container} /bin/bash -c "mysql -uroot -p${DB_PASSWORD} cover_info < /tmp/${backup_source_filename_unzipped}"
