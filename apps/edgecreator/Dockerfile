FROM node:18 as pnpm

RUN npm i -g pnpm

FROM pnpm AS build

WORKDIR /app
COPY . ./
RUN pnpm i -r -F ~edgecreator... -r -F ~edgecreator-api...
RUN pnpm build -r -F ~edgecreator... -r -F ~edgecreator-api...

FROM nginx AS app
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY ./apps/edgecreator/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/edgecreator/dist /usr/share/nginx/html

FROM pnpm AS api
LABEL org.opencontainers.image.authors="admin@ducksmanager.net"

WORKDIR /app

COPY ./apps/edgecreator/.env /app/

COPY --from=build /apps/edgecreator/api/dist /app/

EXPOSE 3000

CMD ["node", "index.js"]
