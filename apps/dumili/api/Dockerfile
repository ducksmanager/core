FROM node:20-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY apps/dumili/api/client_dumili/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY apps/dumili/api/.env /app/
COPY apps/dumili/api/bundle.mjs /app/

EXPOSE 3001
CMD ["node", "bundle.mjs"]
