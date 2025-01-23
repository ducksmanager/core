FROM node:22-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt update && apt install -y imagemagick && apt clean && rm -rf /var/lib/apt/lists/*
COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY packages/prisma-schemas/client_edgecreator/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY apps/edgecreator/api/.env /app/
COPY apps/edgecreator/api/bundle.mjs /app/
COPY apps/edgecreator/assets/default.svg /app/assets/

EXPOSE 3001
CMD ["node", "bundle.mjs"]
