# Use Node alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies to run Vite build)
RUN npm ci

# Copy project files
COPY . .

# Build the React/Vite app
RUN npm run build

# Expose port (Cloud Run defaults to 8080 or port specified in PORT env var)
EXPOSE 8080

# Start the application using Express
CMD ["node", "server.js"]
