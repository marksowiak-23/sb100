# Use Node alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production runner
COPY package*.json ./
RUN npm install express --omit=dev

# Copy server and built static assets
COPY server.js ./
COPY dist ./dist

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
