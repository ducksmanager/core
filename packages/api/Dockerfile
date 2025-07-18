FROM node:22-slim AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

COPY ./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v3/linux/x64 /bin/napi-v3/linux/x64

RUN npm install --os=linux --cpu=x64 sharp

COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY packages/api/.env /app/

COPY packages/api/services/auth/demo_issues.csv /app/demo_issues.csv
COPY packages/api/services/auth/demo_purchases.csv /app/demo_purchases.csv

COPY packages/api/emails /app/emails
COPY packages/api/dist/ /app/

EXPOSE 3001
CMD ["pm2", "start", "--no-daemon", "-i", "max", "index.mjs"]

FROM api AS api-story-search
EXPOSE 3011
CMD ["pm2", "start", "--no-daemon", "-i", "1", "index-story-search.mjs"]