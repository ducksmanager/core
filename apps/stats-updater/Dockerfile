FROM debian:jessie
MAINTAINER Bruno Perel

RUN apt-get update && \
    apt-get install -y mariadb-client wget

COPY scripts /home/scripts

CMD ["bash", "/home/scripts/update-stats.sh"]
