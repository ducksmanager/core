FROM debian:trixie-slim AS curl-impersonate
ARG CURL_IMPERSONATE_VERSION=0.6.1
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -sSfL -o /tmp/ci.tar.gz \
      "https://github.com/lwthiker/curl-impersonate/releases/download/v${CURL_IMPERSONATE_VERSION}/curl-impersonate-v${CURL_IMPERSONATE_VERSION}.x86_64-linux-gnu.tar.gz" && \
    tar xzf /tmp/ci.tar.gz -C /usr/local/bin curl-impersonate-chrome curl_chrome116

FROM node:26-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app


RUN apt update && apt install -y imagemagick librsvg2-bin ca-certificates && apt clean && rm -rf /var/lib/apt/lists/*
RUN npm install pm2 -g

COPY --from=curl-impersonate /usr/local/bin/curl-impersonate-chrome /usr/local/bin/curl_chrome116 /usr/local/bin/

COPY apps/edgecreator/api/.env /app/
COPY apps/edgecreator/api/assets/default.svg /app/assets/
COPY apps/edgecreator/api/bundle.mjs /app/

EXPOSE 3002
CMD ["pm2", "start", "--no-daemon", "-i", "max", "bundle.mjs"]
