FROM node:18 as pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS build

WORKDIR /app

COPY . ./
RUN --mount=type=cache,id=pnpm-store-dumili,target=/app/.pnpm-store \
    pnpm -r -F !~duckguessr -F !~duckguessr-vue3 i # For some reason it is not enough to only install the strictly necessary dependencies

RUN pnpm -r -F ~dumili... -F ~dumili-api... run build


FROM nginx AS web
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY --from=build /app/apps/dumili/dist /usr/share/nginx/html


FROM pnpm AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY {package.json,pnpm-*.yaml} /app/

WORKDIR /app/apps/dumili/api
COPY --from=build /app/apps/dumili/api/dist/api ./
COPY --from=build /app/packages/axios-helper/package.json ./packages/axios-helper/
COPY --from=build /app/packages/axios-helper/dist ./packages/axios-helper

COPY apps/dumili/api/package.json ./
RUN --mount=type=cache,id=pnpm-store-dumili,target=/app/.pnpm-store \
    pnpm -r -F !~duckguessr -F !~duckguessr-vue3 i --production

COPY ./apps/dumili/api/.env ./.env

EXPOSE 3000

CMD ["node", "index.js"]
