#!/usr/bin/env bash
pastec_local_backup_dir=$1
remote_backup_config=$2 # For instance user@192.168.0.2:/home/user/workspace/mybackup

container_name=`docker-compose ps -q pastec`
container_home=/pastec/build
backup_file_name=pastec-index-last.dat
backup_file_name_compressed=pastec-index-`date +%Y-%m-%d`.dat.7z

docker-compose exec -T pastec curl -X POST -d '{"type":"WRITE", "index_path":"'${backup_file_name}'"}' http://127.0.0.1:4212/index/io
docker cp ${container_name}:${container_home}/${backup_file_name} \
          ${pastec_local_backup_dir}/${backup_file_name} && \
\
7z a -m0=lzma2 ${pastec_local_backup_dir}/${backup_file_name_compressed} \
               ${pastec_local_backup_dir}/${backup_file_name} && \
scp ${pastec_local_backup_dir}/${backup_file_name_compressed} \
    ${remote_backup_config}
