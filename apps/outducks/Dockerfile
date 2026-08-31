FROM mcr.microsoft.com/playwright:v1.58.2-noble AS deployer
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/outducks ./apps/outducks/
COPY packages/prisma-schemas ./packages/prisma-schemas/
COPY util/group-by ./util/group-by/

RUN npm install -g pnpm
RUN pnpm deploy --filter=~outducks --prod --ignore-scripts /app

FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app/apps/outducks
COPY --from=deployer /app /app
COPY apps/outducks/bundle.mjs /app/apps/outducks/bundle.mjs
COPY apps/outducks/.env /app/apps/outducks/.env

CMD ["node", "bundle.mjs"]