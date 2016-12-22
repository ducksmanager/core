#!/usr/bin/env bash

. /home/container.properties

usage(){
  echo "Usage: $0 [--help | [--threads=<Number of threads>]|2 [--images-per-group=<Number of images processed in a row>]|30 [--limit=<Number of images to process>]|1000000"
  exit 1
}

processCovers() {
    local thread_id=$1
    local offset=$((${thread_id}*${IMAGES_PER_GROUP}))

    echo "[Thread $thread_id] Fetching ${IMAGES_PER_GROUP} covers, cover id offset ${processed_covers}"

    SHM_FILE=${SHM_DIR}/coversqls-${thread_id}
    RESULTS_FILE=${DIR}/results-${thread_id}.txt

    rm -f ${SHM_FILE} && touch ${SHM_FILE}

    coverquery=$(getCoverQuery ${IMAGES_PER_GROUP} ${offset})
    mysql -uroot -p${DB_PASSWORD} cover_info -se "$coverquery" > ${RESULTS_FILE}

    if [ ${RESULTS_FILE} ]; then
        while read id fullurl; do
            processImage ${id} ${fullurl} &
        done < ${RESULTS_FILE}
        wait

        mysql -uroot -p${DB_PASSWORD} cover_info -e "$(< ${SHM_FILE})"
    else
        echo "File is empty, no more covers"
    fi
}

getCoverQuery() {
    local images_per_group=$1
    local offset=$2
    echo "\
    SELECT \
        id,\
        concat(\
            'http://outducks.org/', \
            sitecode,
            '/',
            case sitecode when 'webusers' then 'webusers/' else '' end, \
            url\
        ) as fullurl \
        from covers \
        left join cover_imports on covers.id = cover_imports.coverid \
        where cover_imports.coverid IS NULL \
        limit $images_per_group \
        offset $offset"
}

getCoverLogInsertSuccessQuery() {
    local id=$1
    local datetime=$(date +'%F %T')
    echo "insert into cover_imports(coverid,imported) values ('$id','$datetime');"
}

getCoverLogInsertErrorQuery() {
    local id=$1
    local error=$2
    echo "insert into cover_imports(coverid,import_error) values ('$id','$error');"
}

downloadPicture() {
    local url=$1
    local output=$2
    if wget -q "${url}" -O ${output} > /dev/null; then
        if [[ "$( wc -m ${output} | awk '{print $1}' )" -lt 200 ]]; then
            return -1
        else
            return 0
        fi
    else
        echo "Failed"
        return -1
    fi
}

addQueryToSqlList() {
    str=$1
    echo -n "$str" >>${SHM_FILE};
}

processImage() {
    local id=$1
    local fullurl=$2

    output=${DOWNLOAD_DIR_TMP}/cover_${id}.jpg
    fullurl=$(echo ${fullurl}|tr -d '\r'|tr -d '\n')
    fullurlHr="https://coa.inducks.org/hr.php?image="${fullurl}
    log="\nid: $id, fullurl: $fullurl, fullurlHr: $fullurlHr\n"

    if downloadPicture ${fullurlHr} ${output}; then
        log=${log}"Downloaded ${fullurlHr}\n"
    else
        log=${log}"Failed to download HR version ${fullurlHr}\n"
        if downloadPicture ${fullurl} ${output}; then
            log=${log}"Downloaded ${fullurl}\n"
        else
            log=${log}"Failed to download ${fullurl}\n"
            addQueryToSqlList "$(getCoverLogInsertErrorQuery ${id} "Failed to download")"
            rm -f ${output}
            echo -e ${log}
            return
        fi
    fi

    PASTEC_OUTPUT=$(curl -s -S -X PUT --data-binary @${output} http://${PASTEC_CONTAINER_NAME}:4212/index/images/${id})
    if [[ ${PASTEC_OUTPUT} == *"IMAGE_ADDED"* ]]; then
        log=${log}"Imported\n"
        addQueryToSqlList "$(getCoverLogInsertSuccessQuery ${id})"
    else
        log=${log}"Failed to import : $PASTEC_OUTPUT\n"
        addQueryToSqlList "$(getCoverLogInsertErrorQuery ${id} ${PASTEC_OUTPUT})"
    fi
    rm -f ${output}
    echo -e ${log}
}

SHM_DIR=/dev/shm
LIMIT=30
IMAGES_PER_GROUP=5
THREADS=2

while :
do
    case $1 in
        --threads=*)
            THREADS=${1#*=}
            shift
            ;;
        --images-per-group=*)
            IMAGES_PER_GROUP=${1#*=}
            shift
            ;;
        --limit=*)
            LIMIT=${1#*=}
            shift
            ;;
        --help)
            usage
            exit
            ;;
        --) # End of all options
            shift
            break
            ;;
        -*)
            echo "FATAL: Unknown option (ignored): $1" >&2
            usage
            shift
            ;;
        *)  # no more options. Stop while loop
            break
            ;;
    esac
done

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOWNLOAD_DIR_TMP=${DIR}/download_tmp

mkdir -p ${DOWNLOAD_DIR_TMP}
chmod a+w ${DOWNLOAD_DIR_TMP}

processed_covers=0

while [ ${processed_covers} -lt ${LIMIT} ]; do
    for ((thread_id=0; thread_id < THREADS; thread_id++)); do
        processCovers ${thread_id} &
    done
    wait
    processed_covers=$(($processed_covers + $THREADS * $IMAGES_PER_GROUP))
done

echo "Done with $THREADS threads and $IMAGES_PER_GROUP images per group"
