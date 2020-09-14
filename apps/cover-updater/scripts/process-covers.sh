#!/usr/bin/env bash

LIMIT_DEFAULT=1000000
IMAGES_PER_GROUP_DEFAULT=2
THREADS_DEFAULT=5

LIMIT=${LIMIT_DEFAULT}
IMAGES_PER_GROUP=${IMAGES_PER_GROUP_DEFAULT}
THREADS=${THREADS_DEFAULT}

usage(){
  echo "Usage: $0 [--help | [--threads=<Number of threads>]|$THREADS_DEFAULT [--images-per-group=<Number of images processed in a row>]|$IMAGES_PER_GROUP_DEFAULT [--limit=<Number of images to process>]|$LIMIT_DEFAULT"
  exit 1
}

deleteNonIndexedCovers() {
  coversInDbButNotInIndex=$(comm -23 \
    <(mysql -uroot -p${MYSQL_COVER_INFO_PASSWORD} -h ${MYSQL_COVER_INFO_HOST} -BN ${MYSQL_COVER_INFO_DATABASE} -e \
      "select coverid from cover_imports where import_error is null" | sed 's/[^0-9]//g' | sort) \
    <(curl -X GET http://${PASTEC_HOST}:${PASTEC_PORT}/index/imageIds | head | jq '.image_ids' | grep -Po '[\d]+' | sort))

  # Delete referenced covers that are not in the index, by chunks of 20
  echo "$coversInDbButNotInIndex" | tr ' ' '\n' |paste -sd',,,,,,,,,,,,,,,,,,,,\n' | while read -r chunk; do
    nonIndexedCoversQuery="DELETE FROM cover_imports where coverid in ($chunk);"
    mysql -uroot -p${MYSQL_COVER_INFO_PASSWORD} -h ${MYSQL_COVER_INFO_HOST} ${MYSQL_COVER_INFO_DATABASE} -e "$nonIndexedCoversQuery"
  done

}

processCovers() {
    local thread_id=$1
    local offset=$((${thread_id}*${IMAGES_PER_GROUP}))

    echo "[Thread $thread_id] Fetching ${IMAGES_PER_GROUP} covers, cover id offset ${processed_covers}"

    SHM_FILE=${SHM_DIR}/coversqls-${thread_id}
    RESULTS_FILE=${DOWNLOAD_DIR_TMP}/results-${thread_id}.txt

    rm -f ${SHM_FILE} && touch ${SHM_FILE}

    coverquery=$(getCoverQuery ${IMAGES_PER_GROUP} ${offset})
    mysql -uroot -p${MYSQL_COVER_INFO_PASSWORD} -h ${MYSQL_COVER_INFO_HOST} ${MYSQL_COVER_INFO_DATABASE} -se "$coverquery" > ${RESULTS_FILE}

    if [ -s ${RESULTS_FILE} ]; then
        while read id fullurl; do
            processImage ${id} ${fullurl} ${thread_id} &
        done < ${RESULTS_FILE}
        wait

        mysql -uroot -p${MYSQL_COVER_INFO_PASSWORD} -h ${MYSQL_COVER_INFO_HOST} ${MYSQL_COVER_INFO_DATABASE} -e "$(< ${SHM_FILE})"
    else
        echo "[Thread $thread_id] File is empty, no more covers"
    fi
}

getCoverQuery() {
    local images_per_group=$1
    local offset=$2
    echo `cat ${DIR}/sql/get-imported-covers.sql | sed "s/_IMAGES_PER_GROUP_/$images_per_group/" | sed "s/_COVER_OFFSET_/$offset/"`
}

getCoverLogInsertSuccessQuery() {
    local id=$1
    local datetime=$(date +'%F %T')
    echo `cat ${DIR}/sql/log-cover-import-success.sql | sed "s/_COVERID_/$id/" | sed "s/_IMPORT_DATE_/$datetime/"`
}

getCoverLogInsertErrorQuery() {
    local id=$1
    local error=$2
    echo `cat ${DIR}/sql/log-cover-import-error.sql | sed "s/_COVERID_/$id/" | sed "s/_ERROR_MESSAGE_/$error/"`
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
        return -1
    fi
}

addQueryToSqlList() {
    SHM_FILE=${SHM_DIR}/coversqls-$1
    str=$2
    echo -n "$str" >>${SHM_FILE};
}

processImage() {
    local id=$1
    local fullurl=$2
    local thread_id=$3

    output=${DOWNLOAD_DIR_TMP}/cover_${id}.jpg
    fullurl=$(echo ${fullurl}|tr -d '\r'|tr -d '\n')
    fullurlHr="https://inducks.org/hr.php?normalsize=1&image="${fullurl}
    log="\n[Thread $thread_id] id: $id, fullurl: $fullurl, fullurlHr: $fullurlHr\n"

    if downloadPicture ${fullurlHr} ${output}; then
        log=${log}"[Thread $thread_id] Downloaded HR version ${fullurlHr}\n"
    else
        log=${log}"[Thread $thread_id] Failed to download HR version ${fullurlHr}\n"
        if downloadPicture ${fullurl} ${output}; then
            log=${log}"[Thread $thread_id] Downloaded ${fullurl}\n"
        else
            log=${log}"[Thread $thread_id] Failed to download ${fullurl}\n"
            addQueryToSqlList ${thread_id} "$(getCoverLogInsertErrorQuery ${id} "Failed to download")"
            rm -f ${output}
            echo -e ${log}
            return
        fi
    fi

    PASTEC_OUTPUT=$(curl -s -S -X PUT --data-binary @${output} http://${PASTEC_HOST}:${PASTEC_PORT}/index/images/${id})
    if [[ ${PASTEC_OUTPUT} == *"IMAGE_ADDED"* ]]; then
        log=${log}"[Thread $thread_id] Imported\n"
        addQueryToSqlList ${thread_id} "$(getCoverLogInsertSuccessQuery ${id})"
    else
        log=${log}"[Thread $thread_id] Failed to import : $PASTEC_OUTPUT\n"
        addQueryToSqlList ${thread_id} "$(getCoverLogInsertErrorQuery ${id} ${PASTEC_OUTPUT})"
    fi
    rm -f ${output}
    echo -e ${log}
}

SHM_DIR=/dev/shm

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
DOWNLOAD_DIR_TMP=/tmp/download_tmp

mkdir -p ${DOWNLOAD_DIR_TMP}
chmod a+w ${DOWNLOAD_DIR_TMP}

processed_covers=0
no_more_covers=false

deleteNonIndexedCovers

while [ ${processed_covers} -lt ${LIMIT} ] && [ ${no_more_covers} = "false" ] ; do
    for ((thread_id=0; thread_id < THREADS; thread_id++)); do
        processCovers ${thread_id} &
    done
    wait

    for ((thread_id=0; thread_id < THREADS; thread_id++)); do
        RESULTS_FILE=${DOWNLOAD_DIR_TMP}/results-${thread_id}.txt
        if [ -s ${RESULTS_FILE} ]; then
            new_processed_covers=`grep -o 'Downloaded' ${SHM_DIR}/coversqls-$thread_id  | wc -l`
            processed_covers=$(($processed_covers + $new_processed_covers))
        else
            no_more_covers=true
        fi
    done

done

echo "Processed $processed_covers covers with $THREADS threads and $IMAGES_PER_GROUP images per group"
