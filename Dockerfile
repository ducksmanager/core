FROM node:16 as pnpm
LABEL org.opencontainers.image.authors="Bruno Perel"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS build
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/dumili/package.json ./apps/dumili/
COPY apps/dumili/api/package.json ./apps/dumili/api/
COPY packages/api/package.json ./packages/api/
COPY packages/api-routes/package.json ./packages/api-routes/
COPY packages/types/package.json ./packages/types/
COPY packages/prisma-clients/package.json ./packages/prisma-clients/
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm -r i

COPY . ./
RUN mv apps/web/.env.prod.local ./apps/web/.env
RUN pnpm -r run build

FROM nginx AS web
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html


FROM pnpm AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY --from=build /app/packages/prisma-clients ./packages/prisma-clients
COPY --from=build /app/packages/types ./packages/types
COPY --from=build /app/packages/prisma-clients/dist/ ./packages/prisma-clients
COPY --from=build /app/packages/types/dist/ ./packages/types

WORKDIR /app/packages/api
COPY --from=build /app/packages/api/dist/api ./

COPY packages/api/package.json ./
COPY packages/api/translations ./translations

RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm i --production

COPY ./packages/api/routes/demo/*.csv ./routes/demo/
COPY ./packages/api/emails ./emails/
COPY ./packages/api/.env.prod.local ./.env

EXPOSE 3000

CMD ["node", "index.js"]


FROM nginx AS dumili
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY --from=build /app/apps/dumili/dist /usr/share/nginx/html


FROM pnpm AS dumili-api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

WORKDIR /app/apps/dumili/api
COPY --from=build /app/apps/dumili/api/dist/apps/dumili/api ./

COPY apps/dumili/api/package.json ./
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm install --production

COPY ./apps/dumili/api/.env.prod.local ./.env

EXPOSE 3000

CMD ["node", "index.js"]
