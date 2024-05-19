FROM pnpm
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

COPY dist /app
COPY package.json /app
COPY pnpm-lock.yaml /app
RUN pnpm i --production --frozen-lockfile

EXPOSE 3001

WORKDIR /app/apps/edgecreator/api
CMD ["node", "index.js"]
