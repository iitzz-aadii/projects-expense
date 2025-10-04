# Netlify Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare the Application

Run the deployment script:

```bash
# Windows
deploy-to-netlify.bat

# Linux/Mac
chmod +x deploy-to-netlify.sh
./deploy-to-netlify.sh
```

### 2. Deploy to Netlify

#### Option A: Drag & Drop (Easiest)

1. Go to [Netlify](https://netlify.com)
2. Drag the `frontend/build` folder to the deploy area
3. Your site will be live immediately!

#### Option B: Git Integration (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically deploy from the `netlify.toml` configuration

### 3. Configure Environment Variables

In your Netlify dashboard:

1. Go to Site Settings → Environment Variables
2. Add: `REACT_APP_BACKEND_URL` = `https://your-backend-api.herokuapp.com`

### 4. Update Backend URL

Replace `https://your-backend-api.herokuapp.com` in:

- `netlify.toml` (line 7 and 11)
- Environment variables in Netlify dashboard

## 🔧 Backend Deployment Options

### Option 1: Heroku (Recommended)

```bash
cd backend
heroku create your-app-name
git subtree push --prefix backend heroku main
```

### Option 2: Railway

1. Connect GitHub repository
2. Set root directory to `backend`
3. Railway auto-detects Python

### Option 3: Render

1. Connect GitHub repository
2. Set build command: `pip install -r requirements-simple.txt`
3. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

## 📋 Environment Variables

### Frontend (Netlify)

```
REACT_APP_BACKEND_URL=https://your-backend-api.herokuapp.com
```

### Backend (Heroku/Railway/Render)

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=student_expense_manager
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGINS=https://your-frontend.netlify.app
```

## 🧪 Testing Your Deployment

### 1. Test Backend API

```bash
curl https://your-backend-api.herokuapp.com/api/
```

### 2. Test Frontend

- Visit your Netlify URL
- Try logging in with demo credentials:
  - **Email**: `demo@student.com`
  - **Password**: `demo123`

### 3. Test API Integration

- Login should work without errors
- Dashboard should load with demo data
- All features should be functional

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Update `CORS_ORIGINS` in backend environment variables
   - Include your Netlify domain

2. **API Connection Issues**

   - Verify `REACT_APP_BACKEND_URL` in Netlify environment variables
   - Check backend deployment logs

3. **Build Failures**

   - Ensure Node.js version is 18.x
   - Clear npm cache: `npm cache clean --force`

4. **404 Errors on Refresh**
   - The `netlify.toml` redirects should handle this
   - Ensure all routes redirect to `/index.html`

## 📁 Project Structure for Deployment

```
student-expense-manager/
├── frontend/
│   ├── build/                 # ← Deploy this folder to Netlify
│   ├── src/
│   ├── package.json
│   └── .env.production        # ← Created by deployment script
├── backend/                   # ← Deploy this to Heroku/Railway/Render
│   ├── server.py
│   ├── requirements-simple.txt
│   ├── Procfile
│   └── runtime.txt
├── netlify.toml              # ← Netlify configuration
├── deploy-to-netlify.bat     # ← Windows deployment script
└── deploy-to-netlify.sh      # ← Linux/Mac deployment script
```

## 🎯 Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend built successfully
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Demo login working
- [ ] All features functional

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables
3. Test backend API endpoints
4. Check deployment logs

---

**🎉 Your Student Expense Manager is now live on Netlify!**
