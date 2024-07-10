# This Dockerfile assumes that the context directory is ../..

FROM node:18.18 AS build
LABEL org.opencontainers.image.authors="Bruno Perel"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY packages/prisma-clients ./packages/prisma-clients
COPY apps/duck-estimator ./apps/duck-estimator

RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm -r i

RUN pnpm -r build

###

FROM mcr.microsoft.com/playwright:focal
LABEL org.opencontainers.image.authors="Bruno Perel"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY --from=build /app/packages/prisma-clients ./packages/prisma-clients
COPY --from=build /app/packages/prisma-clients/dist/ ./packages/prisma-clients

WORKDIR /app/apps/duck-estimator
COPY apps/duck-estimator/package.json ./

RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm i --production

COPY --from=build /app/apps/duck-estimator/dist ./
COPY apps/duck-estimator/.env.local .env
COPY apps/duck-estimator/scrapes ./scrapes

CMD ["node", "index.js"]