#!/bin/sh

bash -x ./1_init-db.sh && \
bash -x ./2_calculate-stats.sh && \
bash -x ./3_rename-db.sh
