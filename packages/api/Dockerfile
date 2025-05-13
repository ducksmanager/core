FROM node:22-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

RUN apt-get update && apt-get install -y openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

RUN npm install --os=linux --cpu=x64 sharp @huggingface/transformers 
RUN mkdir -p ../bin/napi-v3/linux/x64
RUN ln -s /app/node_modules/onnxruntime-node/bin/napi-v3/linux/x64/onnxruntime_binding.node bin/napi-v3/linux/x64/onnxruntime_binding.node

COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/

COPY packages/api/.env /app/

COPY packages/api/services/auth/demo_issues.csv /app/demo_issues.csv
COPY packages/api/services/auth/demo_purchases.csv /app/demo_purchases.csv

COPY packages/api/emails /app/emails
COPY packages/api/dist/ /app/

EXPOSE 3001
CMD ["pm2", "start", "--no-daemon", "-i", "max", "index.mjs"]