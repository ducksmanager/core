FROM nginx
LABEL org.opencontainers.image.authors="Bruno Perel"

COPY apps/edges/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/edges/template-variables.conf /etc/nginx/templates/10-variables.conf.template