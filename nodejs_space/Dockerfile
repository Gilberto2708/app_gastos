# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Enable Corepack for Yarn 4.x support
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy package files and Yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies (will create node_modules because of nodeLinker config)
RUN yarn install --immutable

# Copy application files
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Enable Corepack for Yarn 4.x support
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy package files and Yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies (will create node_modules)
RUN yarn install --immutable

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma client in production
RUN yarn prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x start.sh

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using the startup script
CMD ["./start.sh"]
