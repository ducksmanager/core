FROM node:16
MAINTAINER Bruno Perel

WORKDIR /home

COPY package*.json ./
RUN npm install

COPY db.ts index.ts ./
COPY sql ./sql
COPY .env.prod ./.env

CMD ["node_modules/.bin/ts-node", "/home/index.ts"]
