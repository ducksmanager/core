FROM node:16 as pnpm
LABEL org.opencontainers.image.authors="Bruno Perel"

RUN npm i -g pnpm


FROM pnpm AS app-install
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app/apps/web
COPY apps/web/package.json ./
COPY apps/web/pnpm-lock.yaml ./
COPY apps/web/.eslintrc.js ./
COPY apps/web/.prettierrc.js ./
RUN pnpm i


FROM pnpm AS api-build
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app/packages/api

COPY packages/api/package.json packages/api/pnpm-lock.yaml ./
RUN pnpm i

COPY .env.prod.local ./.env
COPY packages/api/prisma ./prisma
RUN pnpm run prisma:generate

COPY types /app/types
COPY translations /app/translations
COPY packages/api .
RUN pnpm run generate-route-types
RUN pnpm run build


FROM app-install AS app-build
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app
COPY translations ./translations
COPY --from=api-build /app/types ./types

WORKDIR /app/apps/web
COPY apps/web/. .
COPY .env.prod.local ./.env
RUN pnpm run build


FROM nginx AS app
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY --from=app-build /app/apps/web/dist /usr/share/nginx/html


FROM pnpm AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY --from=api-build /app/packages/api/package*.json /app/packages/api/.env /app/
RUN pnpm install --production

COPY --from=api-build /app/packages/api/dist /app/
RUN rm -rf packages/api/dist/prisma && mv prisma packages/api/dist/

COPY ./packages/api/routes/demo/*.csv /app/packages/api/routes/demo/
COPY ./packages/api/emails /app/packages/api/emails/

EXPOSE 3000

WORKDIR /app/api
CMD ["node", "index.js"]
