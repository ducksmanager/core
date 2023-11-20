FROM node:18 as pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS build

WORKDIR /app

COPY . ./
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm -r i # For some reason it is not enough to only install the strictly necessary dependencies

RUN pnpm -r -F ~dumili... -F ~dumili-api... run build


FROM nginx AS dumili
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY --from=build /app/apps/dumili/dist /usr/share/nginx/html


FROM pnpm AS dumili-api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY {package.json,pnpm-*.yaml} ./
COPY --from=build /app/packages/axios-helper/dist ./packages/axios-helper
COPY --from=build /app/packages/axios-helper/package.json ./packages/axios-helper/

WORKDIR /app/apps/dumili/api
COPY --from=build /app/apps/dumili/api/dist/api ./

COPY apps/dumili/api/package.json ./
RUN --mount=type=cache,id=pnpm-store,target=/app/.pnpm-store \
    pnpm i --production

COPY ./apps/dumili/api/.env ./.env

EXPOSE 3000

CMD ["node", "index.js"]
