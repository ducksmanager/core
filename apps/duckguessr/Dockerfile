FROM node:14-slim AS install-server

RUN apt-get update \
 && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python fontconfig \
 && apt-get clean

WORKDIR /usr/src/nuxt-app/server
COPY server/package*.json ./
RUN npm install

FROM node:14-slim AS install-nuxt

RUN apt-get update \
 && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python fontconfig \
 && apt-get clean

WORKDIR /usr/src/nuxt-app
COPY package*.json ./
RUN npm install

FROM node:14-slim AS runtime

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

WORKDIR /usr/src/nuxt-app
COPY --from=install-nuxt /usr/src/nuxt-app/node_modules ./node_modules
COPY --from=install-server /usr/src/nuxt-app/server/node_modules server/node_modules

COPY . ./
COPY .env.prod ./.env

RUN ./node_modules/.bin/prisma generate
RUN npm run build

EXPOSE 3000

CMD [ "concurrently", "\"nuxt\"", "\"cd server && nodemon index.ts\"" ]
