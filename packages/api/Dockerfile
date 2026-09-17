FROM node:26-slim AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

COPY ./packages/api/node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/x64 /bin/napi-v6/linux/x64

# ONNX model is downloaded during CI/CD from GitHub release
COPY ./packages/api/services/story-search/model/efficientnet_b0_comic_embedding.onnx /app/services/story-search/model/efficientnet_b0_comic_embedding.onnx

# story-search bundles sharp@0.34 (the sharp-0-34 alias), so install its
# matching linux/x64 native binaries (@img/sharp-linux-x64).
RUN npm install --os=linux --cpu=x64 sharp@0.34.5

COPY packages/api/.env /app/

COPY packages/api/services/auth/demo_issues.csv /app/demo_issues.csv
COPY packages/api/services/auth/demo_purchases.csv /app/demo_purchases.csv

COPY packages/api/emails /app/emails
COPY packages/api/dist/ /app/

EXPOSE 3001
CMD ["pm2", "start", "--no-daemon", "-i", "6", "index.mjs"]

FROM api AS api-story-search
RUN mv /app/scripts/import-entryurl-vectors.mjs /app/
EXPOSE 3011
CMD ["pm2", "start", "--no-daemon", "-i", "1", "index-story-search.mjs"]