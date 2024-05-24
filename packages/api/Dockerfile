FROM node:18-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY packages/api/bundle.mjs /app
COPY packages/prisma-clients/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /app/client_dm/

EXPOSE 3000
CMD ["node", "bundle.mjs"]