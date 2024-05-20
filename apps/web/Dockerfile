FROM nginx AS web
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /prod/web /usr/share/nginx/html


FROM node:18-slim AS api
LABEL org.opencontainers.image.authors="Bruno Perel"

WORKDIR /app

COPY --from=build /prod/api /app

EXPOSE 3000

CMD ["node", "index.js"]
