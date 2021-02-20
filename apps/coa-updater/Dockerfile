FROM mariadb:10.4
MAINTAINER Bruno Perel

RUN apt-get update && \
    apt-get install -y mariadb-client wget csvtool && \
    apt-get clean

COPY scripts/* /docker-entrypoint-initdb.d/
