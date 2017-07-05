#!/usr/bin/env bash

. /home/container.properties

mysql -v -uroot -p$DB_PASSWORD < $1