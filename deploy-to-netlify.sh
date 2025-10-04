#!/bin/bash

echo "🚀 Preparing Student Expense Manager for Netlify Deployment..."

# Set production environment variable
echo "REACT_APP_BACKEND_URL=https://your-backend-api.herokuapp.com" > frontend/.env.production

# Install dependencies
echo "📦 Installing dependencies..."
cd frontend
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build files are in: frontend/build/"
echo ""
echo "🌐 Next steps:"
echo "1. Deploy the 'frontend/build' folder to Netlify"
echo "2. Set environment variable REACT_APP_BACKEND_URL in Netlify dashboard"
echo "3. Update the backend URL in netlify.toml with your actual backend URL"
echo ""
echo "📋 Demo credentials:"
echo "Email: demo@student.com"
echo "Password: demo123"
