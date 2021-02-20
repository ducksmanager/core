FROM node:12-slim

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

RUN apt-get update \
 && apt-get install --no-install-recommends -y git ca-certificates build-essential g++ python fontconfig \
 && apt-get clean

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . /usr/src/nuxt-app/
COPY .env.prod /usr/src/nuxt-app/.env

RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
