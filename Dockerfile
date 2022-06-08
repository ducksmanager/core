FROM php:8.0-fpm AS app
MAINTAINER Bruno Perel

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
 && apt-get install -y \
      git wget unzip nano \
      nodejs \
      libpng-dev libfreetype6-dev libmcrypt-dev libjpeg-dev libpng-dev libicu-dev \
 && apt-get clean \
 && pecl install apcu \
 && echo "extension=apcu.so" > /usr/local/etc/php/conf.d/apcu.ini \
 && docker-php-ext-configure gd \
 && docker-php-ext-install -j$(nproc) opcache intl \
 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
 && mkdir /tmp/sessions && chmod 777 -R /tmp/sessions

COPY . /var/www/html
COPY .git/refs/remotes/origin/vue-3-new--bootstrap /var/www/html/commit.txt
RUN mkdir -p /var/www/html/public/build && chmod a+w -R /var/www/html/public
RUN echo COMMIT=`cat /var/www/html/commit.txt` >> .env.prod.local && rm /var/www/html/commit.txt && \
    mv .env.prod.local .env.local && \
    composer install && npm install && npm run build

RUN chmod a+w -R /var/www/html/var/cache

FROM nginx:1.15 AS web
MAINTAINER Bruno Perel

COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

WORKDIR /var/www/html
COPY --from=app /var/www/html/public public
