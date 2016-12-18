#!/usr/bin/env bash

. /home/container.properties

mysql -uroot -p$DB_PASSWORD < $1