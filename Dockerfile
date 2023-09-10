FROM node:16 as pnpm
LABEL org.opencontainers.image.authors="Bruno Perel"

RUN npm i -g pnpm


FROM pnpm AS build
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
COPY packages/api-routes/package.json ./packages/api-routes/
COPY packages/types/package.json ./packages/types/
COPY packages/prisma-clients/package.json ./packages/prisma-clients/
RUN pnpm -r i

COPY . ./
RUN mv apps/web/.env.prod.local ./apps/web/.env
RUN mv packages/api/.env.prod.local ./packages/api/.env
RUN pnpm -r run build


FROM nginx AS app
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html


FROM pnpm AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY --from=build /app/packages/api/dist /app/
COPY ./packages/api/routes/demo/*.csv /app/packages/api/routes/demo/
COPY ./packages/api/emails /app/packages/api/emails/

EXPOSE 3000

WORKDIR /app/api
CMD ["node", "index.js"]
