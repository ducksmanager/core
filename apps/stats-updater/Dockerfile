FROM oven/bun
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY apps/stats-updater/bundle.mjs /app/

COPY packages/prisma-schemas/client_coa/ /client_coa
COPY packages/prisma-schemas/client_dm/ /client_dm
COPY packages/prisma-schemas/client_dm_stats/ /client_dm_stats
COPY packages/prisma-schemas/schemas/dm_stats/migrations/0_init/migration.sql /dm-stats-ddl.sql

EXPOSE 3000
ENTRYPOINT ["bun", "bundle.mjs"]