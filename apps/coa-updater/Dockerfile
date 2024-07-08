FROM oven/bun
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y mariadb-client wget && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY apps/coa-updater/bundle.mjs /app/

EXPOSE 3000
ENTRYPOINT ["bun", "bundle.mjs"]