FROM oven/bun

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install

CMD ["bun", "run", "dev"]