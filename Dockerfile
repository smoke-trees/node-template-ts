FROM node:alpine as builder
WORKDIR /app
# Copy package.json and package-lock.json
COPY package* ./
# Copy tsconfig.json
COPY tsconfig.json ./
# Install dependencies
RUN npm ci
# Copy source code
COPY src src
# Build
RUN npm run build-nolint


FROM node:alpine
WORKDIR /app
# Copy package.json and package-lock.json
COPY package* ./
# Install dependencies
RUN npm install --production
# Copy built artifacts
COPY --from=builder /app/dist dist
# Run in production mode
ENV NODE_ENV=production
# Start command
CMD ["npm","start"]
