FROM node:18-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY packages/prisma-clients/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY packages/api/package.json /app/package.json
COPY packages/api/.env /app/
COPY packages/api/bundle.mjs /app/
COPY packages/api-routes/bundle.mjs /app/routes/index.mjs

EXPOSE 3000
CMD ["node", "bundle.mjs"]