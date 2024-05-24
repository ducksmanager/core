FROM node:18-slim
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY packages/api/bundle.mjs /app

EXPOSE 3000

CMD ["node", "bundle.mjs"]