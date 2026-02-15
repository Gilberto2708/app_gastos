# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Enable Corepack for Yarn 4.x support
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
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

# Install production dependencies only
COPY package.json yarn.lock ./
RUN yarn install --immutable --production

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma client in production
RUN yarn prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with database migration and seed
CMD ["sh", "-c", "yarn prisma db push && yarn prisma db seed && node dist/src/main.js"]
