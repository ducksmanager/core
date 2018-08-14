FROM alpine
MAINTAINER Bruno Perel

RUN apk add mariadb-client bash

COPY scripts /home/scripts

CMD ["bash", "/home/scripts/update-stats.sh"]
