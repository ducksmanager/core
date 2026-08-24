FROM nginx
LABEL org.opencontainers.image.authors="Bruno Perel"

# The stock nginx config is enough: the viewer is a single page whose state lives in the query
# string, so it needs no SPA rewrite, and nginx's mime.types already maps .wasm correctly.
COPY apps/inducksql/dist /usr/share/nginx/html
