@echo off
echo 🚀 Preparing Student Expense Manager for Netlify Deployment...

REM Set production environment variable
echo REACT_APP_BACKEND_URL=https://your-backend-api.herokuapp.com > frontend\.env.production

REM Install dependencies
echo 📦 Installing dependencies...
cd frontend
call npm ci

REM Build the application
echo 🔨 Building application...
call npm run build

echo ✅ Build completed successfully!
echo 📁 Build files are in: frontend\build\
echo.
echo 🌐 Next steps:
echo 1. Deploy the 'frontend\build' folder to Netlify
echo 2. Set environment variable REACT_APP_BACKEND_URL in Netlify dashboard
echo 3. Update the backend URL in netlify.toml with your actual backend URL
echo.
echo 📋 Demo credentials:
echo Email: demo@student.com
echo Password: demo123
echo.
pause
