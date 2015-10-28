#!/usr/bin/env bash
set -x

WEB_DIRECTORY_ROOT=/var/www
DM_SUBDIR=html/DucksManager
ISV_SUBDIR=inducks/isv

# Run Inducks cron

mkdir -p ${WEB_DIRECTORY_ROOT}/${ISV_SUBDIR}
bash -x ${WEB_DIRECTORY_ROOT}/${DM_SUBDIR}/remote/cron_inducks.sh "${WEB_DIRECTORY_ROOT}/${ISV_SUBDIR}"
