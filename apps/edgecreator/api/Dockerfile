FROM node:22-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt update && apt install -y imagemagick librsvg2-bin && apt clean && rm -rf /var/lib/apt/lists/*
RUN npm install pm2 -g
COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY packages/prisma-schemas/client_edgecreator/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY apps/edgecreator/api/.env /app/
COPY apps/edgecreator/api/assets/default.svg /app/assets/
COPY apps/edgecreator/api/bundle.mjs /app/

EXPOSE 3002
CMD ["pm2", "start", "--no-daemon", "-i", "max", "bundle.mjs"]
