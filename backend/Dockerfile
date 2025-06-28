# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose port for Socket.IO server
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]
