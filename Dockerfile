# Use Node.js 18 (stable version)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Build the TypeScript app
RUN npm run build

# Create directory for models (if it doesn't exist)
RUN mkdir -p models

# Expose port 8080
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the app
CMD ["npm", "run", "start"]
