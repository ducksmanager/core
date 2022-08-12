FROM node:16 AS app
MAINTAINER Bruno Perel

RUN npm i -g pnpm

WORKDIR /app
COPY . .
RUN pnpm i
RUN pnpm run build

FROM nginx:1.15 AS web
MAINTAINER Bruno Perel

COPY --from=app /app/dist /usr/share/nginx/html
