#!/usr/bin/env bash

IMAGE_NAME=$1

docker rmi -f $IMAGE_NAME
docker build . -t $IMAGE_NAME