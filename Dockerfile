FROM node:16 AS app
MAINTAINER Bruno Perel

RUN npm i -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i

COPY . .
RUN pnpm run build

FROM node:16 as api
MAINTAINER Bruno Perel

RUN npm i -g pnpm

WORKDIR /app

COPY ./api/package.json ./api/pnpm-lock.yaml ./
RUN pnpm i

COPY ./api/prisma ./prisma
RUN pnpm run prisma:generate

COPY api .
RUN pnpm run build

EXPOSE 3000

CMD ["node", "build/index.js"]
