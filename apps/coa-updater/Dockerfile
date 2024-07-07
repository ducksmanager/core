FROM debian:buster-slim
LABEL maintainer="Bruno Perel"

RUN apt-get update && \
    apt-get install -y mariadb-client wget csvtool && \
    apt-get clean

COPY scripts/coa-provision.sh /home/scripts/coa-provision.sh
CMD ["bash", "/home/scripts/coa-provision.sh"]
