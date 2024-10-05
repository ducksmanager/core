FROM mcr.microsoft.com/playwright:noble
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY packages/prisma-schemas/client_coa/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prisma-engines/
COPY apps/duck-estimator/.env /app/
COPY apps/duck-estimator/bundle.mjs /app/

CMD ["node", "bundle.js"]