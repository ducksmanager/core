FROM node:22-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY apps/dumili/api/prisma/client_dumili/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY apps/dumili/api/.env /app/
COPY apps/dumili/api/dist/index.mjs /app/bundle.mjs

EXPOSE 3003
CMD ["node", "bundle.mjs"]
