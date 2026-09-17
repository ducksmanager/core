FROM oven/bun:1.3
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY apps/cover-updater/bundle.mjs /app/

COPY packages/prisma-schemas/client_coa/ /client_coa
COPY packages/prisma-schemas/client_cover_info/ /client_cover_info

ENTRYPOINT ["bun", "bundle.mjs"]
