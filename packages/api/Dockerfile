FROM node:18-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY packages/prisma-clients /app/
COPY packages/api/.env /app/
COPY packages/api/bundle.mjs /app/

EXPOSE 3000
CMD ["node", "bundle.mjs"]