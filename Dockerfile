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
COPY translations ./translations
COPY --from=build /app/packages/prisma-clients ./packages/prisma-clients
COPY --from=build /app/packages/types ./packages/types
COPY --from=build /app/packages/prisma-clients/dist/ ./packages/prisma-clients
COPY --from=build /app/packages/types/dist/ ./packages/types

WORKDIR /app/packages/api
COPY --from=build /app/packages/api/dist/packages/api ./

COPY packages/api/package.json ./
RUN pnpm install --production

COPY ./packages/api/routes/demo/*.csv ./routes/demo/
COPY ./packages/api/emails ./emails/

EXPOSE 3000

CMD ["node", "index.js"]
