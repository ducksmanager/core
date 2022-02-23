FROM node:14-slim AS install-socketio

RUN apt-get update \
 && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python fontconfig \
 && apt-get clean

WORKDIR /home
COPY server/package*.json ./
RUN npm install

FROM node:14-slim AS install-nuxt

RUN apt-get update \
 && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python fontconfig \
 && apt-get clean

WORKDIR /home
COPY package*.json ./
RUN npm install

FROM node:14-slim AS runtime-nuxt

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

WORKDIR /usr/src/nuxt-app

COPY . ./
COPY .env.prod ./.env
COPY --from=install-nuxt /home/node_modules ./node_modules

RUN ./node_modules/.bin/prisma generate
RUN npm run build

EXPOSE 3000

CMD [ "nuxt" ]

FROM node:14-slim AS runtime-socketio

WORKDIR /home

COPY server ./
COPY --from=install-socketio /home/node_modules ./node_modules
COPY .env.prod .env

CMD [ "ts-node", "index.ts" ]
