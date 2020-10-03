FROM php:7.4-fpm
MAINTAINER Bruno Perel

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt-get update \
 && apt-get install -y \
      git wget unzip \
      nodejs \
      libpng-dev libfreetype6-dev libmcrypt-dev libjpeg-dev libpng-dev libicu-dev \
 && apt-get clean

RUN pecl install apcu && \
    echo "extension=apcu.so" > /usr/local/etc/php/conf.d/apcu.ini && \
    docker-php-ext-configure gd &&\
    docker-php-ext-install -j$(nproc) opcache intl

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY . /var/www/html

RUN composer install && npm install && npm run build
