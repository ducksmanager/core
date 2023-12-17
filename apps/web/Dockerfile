FROM node:18.18 as pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS build

WORKDIR /app
COPY . ./
RUN --mount=type=cache,id=pnpm-store-web,target=/app/.pnpm-store \
    pnpm -r -F ~web... -F ~api... i

RUN pnpm -r -F ~web... -F ~api... run build

FROM nginx AS web
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html


FROM node:20 AS api-build

WORKDIR /app

RUN curl -fsSL https://bun.sh/install | bash
RUN apt-get update && apt-get install -y jq && apt-get clean

COPY package.json ./
COPY packages ./packages
RUN cat package.json | jq '.workspaces = ["packages/api","packages/prisma-clients","packages/types"]' > package.json.tmp && mv package.json.tmp package.json
RUN ~/.bun/bin/bun i

WORKDIR /app/packages/api
RUN ~/.bun/bin/bun build --entrypoints index.ts --target bun --outdir /out

FROM oven/bun AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY --from=api-build /out /home/bun/app
EXPOSE 3000
ENTRYPOINT ["bun", "run", "/home/bun/app/index.js"]


