FROM node:18-slim AS install-socketio

RUN apt-get update \
    && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python3 fontconfig \
    && apt-get clean

WORKDIR /home
COPY prisma server/package*.json ./
RUN npm install

FROM node:18-slim AS install-nuxt

RUN apt-get update \
    && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python3 fontconfig \
    && apt-get clean

WORKDIR /home
COPY prisma package*.json ./
RUN npm install
RUN ./node_modules/.bin/prisma generate

FROM node:18-slim AS runtime-nuxt

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

WORKDIR /usr/src/nuxt-app

RUN apt-get update \
    && apt-get install --no-install-recommends -y openssl python3 \
    && apt-get clean

COPY . ./
COPY .env.prod ./.env
COPY --from=install-nuxt /home/node_modules ./node_modules

RUN rm -rf server && npm run build

EXPOSE 3000

ENTRYPOINT [ "node_modules/.bin/nuxt", "start" ]

FROM node:18-slim AS runtime-socketio

WORKDIR /home

RUN apt-get update \
    && apt-get install --no-install-recommends -y openssl \
    && apt-get clean

COPY .env.prod .env
COPY server ./server
COPY types ./types

WORKDIR /home/server
COPY --from=install-socketio /home/node_modules ./node_modules
COPY --from=install-nuxt /home/node_modules/.prisma ./node_modules/.prisma
RUN npm install typescript

EXPOSE 4000

ENTRYPOINT [ "./node_modules/.bin/ts-node", "ts" ]
