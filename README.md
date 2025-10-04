# Student Expense Manager

A comprehensive full-stack expense management application designed specifically for students to track expenses, manage budgets, set savings goals, and collaborate with groups.

![Student Expense Manager](https://img.shields.io/badge/React-18.2.0-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-cyan)

## 🚀 Features

### Core Functionality

- **Expense Tracking**: Add, edit, and categorize daily expenses
- **Budget Management**: Set monthly budgets by category with real-time tracking
- **Savings Goals**: Create and track progress towards financial goals
- **Analytics Dashboard**: Visual insights into spending patterns and trends
- **Group Expense Sharing**: Split bills and track shared expenses with friends/roommates

### Advanced Features

- **AI-Powered Chat**: Get personalized financial advice and insights
- **Real-time Notifications**: Stay updated on budget limits and goal progress
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Customizable theme preferences
- **Data Export**: Export expense reports and analytics

## 🛠️ Tech Stack

### Frontend

- **React 18.2.0** - Modern UI library
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Backend

- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **JWT** - Authentication tokens
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Development Tools

- **CRACO** - Create React App Configuration Override
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/student-expense-manager.git
cd student-expense-manager
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run the backend server
python server.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=student_expense_manager

# Security
JWT_SECRET=your-super-secret-jwt-key

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# AI Features (Optional)
EMERGENT_LLM_KEY=your-emergent-llm-api-key
```

#### Frontend (.env.local)

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## 📱 Usage

### Demo Account

For quick testing, use the demo account:

- **Email**: `demo@student.com`
- **Password**: `demo123`

### Key Features

1. **Expense Tracking**

   - Add expenses with categories (Food, Travel, Study Material, Personal)
   - Set custom notes and dates
   - View expense history with filtering

2. **Budget Management**

   - Set monthly budgets by category
   - Track spending against budgets
   - Receive alerts when approaching limits

3. **Savings Goals**

   - Create multiple savings goals
   - Set target amounts and dates
   - Track progress with visual indicators

4. **Group Expenses**

   - Create groups with friends/roommates
   - Split bills automatically
   - Track who owes what with settlement calculations

5. **Analytics**
   - Visual charts of spending patterns
   - Category-wise breakdowns
   - Monthly/yearly comparisons

## 🚀 Deployment

### Netlify Deployment (Frontend)

1. **Build the project**:

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:

   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables in Netlify dashboard

3. **Environment Variables for Production**:
   ```env
   REACT_APP_BACKEND_URL=https://your-backend-api.com
   ```

### Backend Deployment

The backend can be deployed to various platforms:

- **Heroku**: Use the included `Procfile`
- **Railway**: Direct deployment from GitHub
- **DigitalOcean**: App Platform deployment
- **AWS**: EC2 or Elastic Beanstalk

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest
```

## 📁 Project Structure

```
student-expense-manager/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── Dashboard.js
│   │   │   ├── ExpenseTracker.js
│   │   │   ├── BudgetManager.js
│   │   │   ├── SavingsGoals.js
│   │   │   ├── Analytics.js
│   │   │   ├── GroupManager.js
│   │   │   ├── AIChat.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Application entry point
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # TailwindCSS configuration
│   └── craco.config.js     # CRACO configuration
├── tests/                  # Test files
└── README.md              # This file
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 🐛 Troubleshooting

### Common Issues

1. **Frontend build fails**:

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Backend connection issues**:

   - Check MongoDB connection string
   - Verify environment variables
   - Ensure backend server is running

3. **CORS errors**:
   - Update `CORS_ORIGINS` in backend `.env`
   - Include your frontend URL

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- FastAPI for the high-performance backend
- TailwindCSS for the utility-first CSS
- All contributors and users who provided feedback

## 📞 Support

If you encounter any issues or have questions:

- **Create an issue** on GitHub
- **Email**: your.email@example.com
- **Documentation**: [Wiki](https://github.com/yourusername/student-expense-manager/wiki)

---

**Made with ❤️ for students by developers**
