#!/bin/bash

# Test Docker build locally
echo "🐳 Testing Docker build..."

# Build the Docker image
docker build -t modredip-backend .

# Run the container
echo "🚀 Running container..."
docker run -p 5000:5000 --env-file .env.example modredip-backend

echo "✅ Build test completed!" 