# SETUP CHECKLIST

Follow these steps to get your AI-Powered Calorie Calculator running:

## ✅ Step 1: PostgreSQL Setup

1. Install PostgreSQL if not already installed (https://www.postgresql.org/download/)
2. Open PostgreSQL command line or pgAdmin
3. Create a new database:
   ```sql
   CREATE DATABASE calorie_calculator;
   ```
4. Run the schema from `backend/schema.sql` to create tables
5. Note your database credentials (host, port, user, password)

## ✅ Step 2: OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the API key (you won't be able to see it again!)

## ✅ Step 3: Configure Backend Environment Variables

1. Navigate to the `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Edit `.env` with your actual values:
   ```env
   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=calorie_calculator
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   
   JWT_SECRET=your_secure_random_string_here
   JWT_EXPIRES_IN=7d
   
   FRONTEND_URL=http://localhost:5173
   ```

## ✅ Step 4: Configure Frontend Environment Variables

1. In the project root, open `.env.local`
2. Update with your values:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_OPENAI_API_KEY=sk-your-openai-key-here
   ```

## ✅ Step 5: Install Backend Dependencies

```bash
cd backend
npm install
```

## ✅ Step 6: Install Frontend Dependencies (if not already done)

```bash
cd ..
npm install
```

## ✅ Step 7: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on http://localhost:3000
```

## ✅ Step 8: Start the Frontend (in a new terminal)

```bash
cd ..
npm run dev
```

## ✅ Step 9: Test the Application

1. Open http://localhost:5173
2. Click "Register" and create an account
3. Log in with your credentials
4. You should be redirected to the dashboard

## 🎉 You're Done!

Now you can:
- Set your daily calorie goal in Profile
- Add entries using text or images
- Track your progress on the Dashboard
- View history of past days

## Common Issues

**"Failed to connect to PostgreSQL"**
- Check that PostgreSQL is running
- Verify database credentials in `backend/.env`
- Ensure the `calorie_calculator` database exists

**"Authentication required"**
- Make sure backend is running on port 3000
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

**AI analysis fails**
- Verify OpenAI API key is correct in frontend `.env.local`
- Ensure you have credits in your OpenAI account
- Check you have access to GPT-4o models

**Images won't upload**
- Verify `backend/uploads` directory exists (created automatically)
- Check file size is under 10MB
- Ensure you're logged in with valid token

## Architecture

**Backend** (Node.js + Express + PostgreSQL)
- `/api/auth/*` - Authentication endpoints
- `/api/entries/*` - Calorie entry management
- `/uploads/*` - Static file serving for images

**Frontend** (Vue 3 + TypeScript)
- Communicates with backend via REST API
- JWT token stored in localStorage
- Auto-redirects on auth errors
