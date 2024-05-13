FROM node:16 as pnpm

RUN npm i -g pnpm

FROM pnpm AS app-install

WORKDIR /app
COPY package.json pnpm-lock.yaml .eslintrc.js ./
RUN pnpm i

FROM app-install AS api-build

WORKDIR /app/api

COPY api/package.json api/pnpm-lock.yaml ./
RUN pnpm i

COPY .env.prod ./.env

COPY types /app/types
COPY api .
RUN mv tsconfig.prod.json tsconfig.json
RUN mkdir dm-types && cp -r node_modules/ducksmanager/types/* dm-types/
RUN mkdir prisma-clients && cp -r node_modules/ducksmanager/api/dist/prisma/* prisma-clients/
RUN sed -i 's#../api/dist/prisma#~prisma-clients#g' dm-types/*.ts
RUN pnpm run generate-route-types
RUN pnpm run build

FROM app-install AS app-build

WORKDIR /app

COPY . .
COPY .env.prod ./.env
COPY --from=api-build /app/api api
RUN pnpm run build

FROM nginx AS app
LABEL org.opencontainers.image.authors="admin@ducksmanager.net"

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=app-build /app/dist /usr/share/nginx/html

FROM pnpm AS api
LABEL org.opencontainers.image.authors="admin@ducksmanager.net"

WORKDIR /app

COPY --from=api-build /app/api/package*.json /app/api/.env /app/
RUN pnpm install --production

COPY --from=api-build /app/api/dist /app/

EXPOSE 3000

WORKDIR /app/api
CMD ["node", "index.js"]
