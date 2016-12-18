#!/usr/bin/env bash

. /home/container.properties

usage(){
  echo "Usage: $0 [--help | [--images-per-group=<Number of images processed in a row>]|50 [--limit=<Number of images to process>]|1000000"
  exit 1
}

getCoverQuery() {
    local images_per_group=$1
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
        limit $images_per_group"
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

SHM_FILE=/dev/shm/coversqls
LIMIT=200000
IMAGES_PER_GROUP=5

while :
do
    case $1 in
        --images-per-group)
            IMAGES_PER_GROUP=${1#*=}
            shift
            ;;
        --limit)
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

for ((a=0; a < LIMIT; a+=${IMAGES_PER_GROUP})); do
    rm -f ${SHM_FILE} && touch ${SHM_FILE}

    echo "Fetching ${IMAGES_PER_GROUP} covers, cover id offset ${a}"
    coverquery=$(getCoverQuery ${IMAGES_PER_GROUP})
    coverimportlogqueries=""
    coverimporterrorlogqueries=""

    mysql -uroot -p$DB_PASSWORD cover_info -se "$coverquery" > ${DIR}/results.txt

    while read id fullurl; do
        processImage ${id} ${fullurl} &
    done < ${DIR}/results.txt

    wait

    mysql -uroot -p$DB_PASSWORD cover_info -e "$(< ${SHM_FILE})"

done
