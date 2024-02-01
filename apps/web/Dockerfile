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


FROM pnpm AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY package.json ./
COPY pnpm-*.yaml ./

COPY --from=build /app/packages/prisma-clients ./packages/prisma-clients
COPY --from=build /app/packages/types ./packages/types
COPY --from=build /app/packages/prisma-clients/dist/ ./packages/prisma-clients
COPY --from=build /app/packages/types/dist/ ./packages/types
COPY --from=build /app/packages/api/dist/api ./packages/api

COPY packages/api/package.json ./packages/api
COPY packages/api/translations ./packages/api/translations
COPY packages/api/emails ./packages/api/emails

RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm i --production

COPY ./packages/api/services ./services/
COPY ./packages/api/emails ./emails/
COPY ./packages/api/.env ./.env

EXPOSE 3000

CMD ["node", "packages/api/index.js"]
