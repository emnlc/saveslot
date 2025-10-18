FROM oven/bun:latest
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Start the app
CMD ["bun", "run", "start"]