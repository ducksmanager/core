FROM node:22-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN npm install pm2 -g
COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY packages/api/.env /app/

COPY packages/api/services/auth/demo_issues.csv /app/demo_issues.csv
COPY packages/api/services/auth/demo_purchases.csv /app/demo_purchases.csv

# Debug
RUN grep GITHUB_NAME /app/.env

COPY packages/api/emails /app/emails
COPY packages/api/dist/index.js /app/index.mjs

EXPOSE 3000
CMD ["pm2", "start", "--no-daemon", "-i", "max", "index.mjs"]