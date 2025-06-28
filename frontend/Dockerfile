# Base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy build from builder
COPY --from=builder /app ./

# Expose frontend port
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start"]
