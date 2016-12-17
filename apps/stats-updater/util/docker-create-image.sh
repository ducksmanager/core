#!/usr/bin/env bash
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/..

IMAGE_NAME=$1

docker rmi -f $IMAGE_NAME
docker build $ROOT_DIR -t $IMAGE_NAME