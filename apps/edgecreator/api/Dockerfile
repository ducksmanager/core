FROM pnpm
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

RUN apt update && apt install -y imagemagick && apt clean && rm -rf /var/lib/apt/lists/*

COPY dist/index.js /app/index.mjs

EXPOSE 3000

CMD ["node", "index.mjs"]
