FROM mcr.microsoft.com/playwright:v1.58.0-noble
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY apps/duck-estimator/.env /app/
COPY apps/duck-estimator/bundle.mjs /app/
COPY apps/duck-estimator/scrapes /app/scrapes

CMD ["node", "bundle.mjs"]