FROM debian:jessie
MAINTAINER Bruno Perel

RUN apt-get update && \
    apt-get install -y wget curl mariadb-client

COPY scripts /home/scripts
RUN chmod -R +x /home/scripts

CMD bash -c /home/scripts/import-covers.sh && bash -c /home/scripts/process-covers.sh
