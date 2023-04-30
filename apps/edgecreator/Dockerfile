FROM node:16 as pnpm
MAINTAINER Bruno Perel

RUN npm i -g pnpm

FROM pnpm AS app-install
MAINTAINER Bruno Perel

WORKDIR /app
COPY package.json pnpm-lock.yaml .eslintrc.js ./
RUN pnpm i

FROM app-install AS api-build
MAINTAINER Bruno Perel

WORKDIR /app/api

COPY api/package.json api/pnpm-lock.yaml ./
RUN pnpm i

COPY .env.prod ./.env

COPY types /app/types
COPY tsconfig.json /app/tsconfig.json
COPY api .
RUN pnpm run generate-route-types
RUN pnpm run build

FROM app-install AS app-build
MAINTAINER Bruno Perel

WORKDIR /app

COPY . .
COPY .env.prod ./.env
COPY --from=api-build /app/api api
COPY --from=api-build /app/types/routes.ts types/routes.ts
RUN pnpm run build

FROM nginx AS app
MAINTAINER Bruno Perel

COPY --from=app-build /app/dist /usr/share/nginx/html

FROM pnpm AS api
MAINTAINER Bruno Perel

WORKDIR /app

COPY --from=api-build /app/api/package*.json /app/api/.env /app/
RUN pnpm install --production

COPY --from=api-build /app/api/dist /app/

EXPOSE 3000

WORKDIR /app/api
CMD ["node", "index.js"]
