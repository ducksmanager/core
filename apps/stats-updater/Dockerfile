FROM oven/bun
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.pnpm.io/install.sh | sh -

COPY apps/stats-updater/bundle.mjs /app/

COPY packages/prisma-schemas/client_dm/libquery_engine-debian-openssl-1.1.x.so.node /tmp/prisma-engines/

EXPOSE 3000
ENTRYPOINT ["bun", "bundle.mjs"]