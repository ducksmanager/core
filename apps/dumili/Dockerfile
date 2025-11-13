FROM nginx AS web
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/dumili/nginx.conf /etc/nginx/nginx.conf
COPY apps/dumili/dist /usr/share/nginx/html

FROM nginx AS storybook
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/dumili/storybook-static /usr/share/nginx/html
