FROM node:26-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY apps/dumili/api/.env /app/
COPY apps/dumili/api/dist/index.mjs /app/bundle.mjs
COPY apps/dumili/api/dist/instrument.mjs /app/instrument.mjs
COPY apps/dumili/api/dist/unrar.wasm /app/unrar.wasm
COPY apps/dumili/api/dist/pdf.worker.mjs /app/pdf.worker.mjs

# @napi-rs/canvas ships platform-specific native bindings that cannot be bundled;
# installing here lets npm pick the correct Linux x64 binary for this image.
RUN npm install @napi-rs/canvas@1.0.0 --no-save

EXPOSE 3003
CMD ["node", "--import", "./instrument.mjs", "bundle.mjs"]
