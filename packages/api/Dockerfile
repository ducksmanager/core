FROM node:18-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /client_coa/
COPY packages/prisma-schemas/client_cover_info/libquery_engine-debian-openssl-3.0.x.so.node /client_cover_info/
COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /client_dm/
COPY packages/prisma-schemas/client_dm_stats/libquery_engine-debian-openssl-3.0.x.so.node /client_dm_stats/
COPY packages/prisma-schemas/client_edgecreator/libquery_engine-debian-openssl-3.0.x.so.node /client_edgecreator/
COPY packages/api/.env /app/
COPY packages/api/bundle.mjs /app/

EXPOSE 3000
CMD ["node", "bundle.mjs"]