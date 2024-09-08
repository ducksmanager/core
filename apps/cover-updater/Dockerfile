FROM debian:buster
LABEL maintainer="Bruno Perel"

RUN apt-get update && \
    apt-get install -y --no-install-recommends wget curl mariadb-client ca-certificates jq && \
    rm -rf /var/lib/apt/lists/*

COPY apps/cover-updater/scripts /home/scripts
RUN chmod -R +x /home/scripts

CMD bash -c /home/scripts/import-covers.sh && bash -c /home/scripts/process-covers.sh
