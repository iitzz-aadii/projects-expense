# Deployment Guide

## Netlify Deployment (Frontend)

### Prerequisites

- GitHub repository with your code
- Netlify account
- Backend API deployed (Heroku, Railway, etc.)

### Steps

1. **Build the Frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**

   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - Build command: `cd frontend && npm run build`
     - Publish directory: `frontend/build`
   - Add environment variables:
     - `REACT_APP_BACKEND_URL`: Your backend API URL

3. **Configure Redirects**
   - The `netlify.toml` file is already configured
   - Update the backend URL in the redirects section

## Backend Deployment Options

### Option 1: Heroku

1. Create a `Procfile` in the backend directory:

   ```
   web: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

2. Deploy to Heroku:
   ```bash
   cd backend
   heroku create your-app-name
   git subtree push --prefix backend heroku main
   ```

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Set the root directory to `backend`
3. Railway will automatically detect Python and install dependencies

### Option 3: DigitalOcean App Platform

1. Create a new app from GitHub
2. Set the source directory to `backend`
3. Configure environment variables

## Environment Variables

### Frontend (.env.production)

```
REACT_APP_BACKEND_URL=https://your-backend-api.herokuapp.com
```

### Backend

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=student_expense_manager
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGINS=https://your-frontend.netlify.app
```

## Testing Deployment

1. **Test Backend API**

   ```bash
   curl https://your-backend-api.herokuapp.com/
   ```

2. **Test Frontend**
   - Visit your Netlify URL
   - Try logging in with demo credentials:
     - Email: `demo@student.com`
     - Password: `demo123`

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Update `CORS_ORIGINS` in backend environment variables
   - Include your frontend domain

2. **Build Failures**

   - Check Node.js version (use 18.x)
   - Clear npm cache: `npm cache clean --force`

3. **API Connection Issues**
   - Verify backend URL in frontend environment variables
   - Check backend deployment logs

## Manual Testing Commands

```bash
# Test backend
curl https://your-backend-api.herokuapp.com/

# Test API endpoint
curl https://your-backend-api.herokuapp.com/api/

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-backend-api.herokuapp.com/api/expenses
```
