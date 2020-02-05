FROM debian:jessie
MAINTAINER Bruno Perel

RUN apt-get update && \
    apt-get install -y mariadb-client wget && \
    apt-get clean

COPY scripts/coa-provision.sh /home/scripts/coa-provision.sh

CMD ["bash", "/home/scripts/coa-provision.sh"]
