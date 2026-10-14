FROM public.ecr.aws/docker/library/node:26.3.1-bookworm AS builder
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm@10.20.0
# Copy dependency files first for better layer caching
COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN pnpm install 
# Copy project files
COPY tsconfig.json ./
COPY src ./src
# Build
RUN pnpm run build


FROM public.ecr.aws/docker/library/node:26.3.1-bookworm
# Install Chrome and dependencies
WORKDIR /app
RUN npm install -g pnpm@10.20.0
COPY package.json pnpm-lock.yaml ./
# Install production dependencies only
RUN pnpm install --prod 
# Remove this if you're using the system Chrome
COPY --from=builder /app/dist ./dist
# COPY Templates ./Templates
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=6144"
ENV NODE_COMPILE_CACHE="/app/.cache/node-compile-cache"
CMD ["pnpm", "start"]

