FROM mcr.microsoft.com/playwright:v1.56.1-noble
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY apps/outducks/.env /app/
COPY apps/outducks/bundle.mjs /app/

CMD ["node", "bundle.mjs"]