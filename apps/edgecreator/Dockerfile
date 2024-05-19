FROM nginx
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /usr/share/nginx/html

COPY --from=dm-build /prod/edgecreator/dist /usr/share/nginx/html
# COPY apps/web/nginx.conf /etc/nginx/nginx.conf