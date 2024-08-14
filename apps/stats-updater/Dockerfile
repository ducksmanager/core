FROM oven/bun
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY apps/stats-updater/bundle.mjs /app/

EXPOSE 3000
ENTRYPOINT ["bun", "bundle.mjs"]