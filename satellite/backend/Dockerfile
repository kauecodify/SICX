# SICX Satellite Tracking - Backend Dockerfile

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Create necessary directories
RUN mkdir -p config data certs

# Expose ports
EXPOSE 3000 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV WS_PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server/index.js"]
