# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Create dist directory if it doesn't exist
RUN mkdir -p dist

# Build TypeScript
RUN yarn build

# Verify the build was successful
RUN ls -la dist/

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Command to run the application
CMD ["yarn", "start"] 