FROM pnpm
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt update && apt install -y imagemagick && apt clean && rm -rf /var/lib/apt/lists/*

COPY dist/bundle.js /app/index.mjs

EXPOSE 3001

CMD ["node", "index.mjs"]
