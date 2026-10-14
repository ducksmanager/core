FROM oven/bun:1.4
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y mariadb-client && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY packages/backup/.env /app/
COPY packages/backup/bundle.mjs /app/

ENTRYPOINT ["bun", "bundle.mjs"]