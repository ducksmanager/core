FROM mcr.microsoft.com/playwright:v1.47.2-noble
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY apps/duck-estimator/.env /app/
COPY apps/duck-estimator/bundle.mjs /app/
COPY apps/duck-estimator/scrapes /app/scrapes

CMD ["node", "bundle.mjs"]