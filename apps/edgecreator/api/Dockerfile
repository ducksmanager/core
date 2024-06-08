FROM node:18-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt update && apt install -y imagemagick && apt clean && rm -rf /var/lib/apt/lists/*

COPY packages/prisma-clients /app/
COPY apps/edgecreator/.env /app/
COPY apps/edgecreator/api/bundle.mjs /app/

EXPOSE 3001
CMD ["node", "bundle.mjs"]
