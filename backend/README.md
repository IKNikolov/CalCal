# Node.js Backend README

This is the backend server for the AI-Powered Calorie Calculator application.

## Tech Stack

- **Node.js** with ES Modules
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calorie_calculator
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Create Database

```sql
CREATE DATABASE calorie_calculator;
```

Then run `schema.sql` to create tables:

```bash
psql -U postgres -d calorie_calculator -f schema.sql
```

### 4. Run the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "daily_calorie_goal": 2000
  }
}
```

#### POST `/api/auth/login`
Login existing user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### GET `/api/auth/me`
Get current user profile (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "daily_calorie_goal": 2000,
  "created_at": "2026-01-19T...",
  "updated_at": "2026-01-19T..."
}
```

#### PATCH `/api/auth/calorie-goal`
Update daily calorie goal (requires auth).

**Body:**
```json
{
  "daily_calorie_goal": 2500
}
```

### Calorie Entries

#### GET `/api/entries?date=YYYY-MM-DD`
Get entries for a specific date (requires auth).

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "entry_date": "2026-01-19",
    "food_description": "2 eggs, toast",
    "total_calories": 350,
    "entry_type": "text",
    "image_url": null,
    "ai_response": {...},
    "confidence": "high",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

#### GET `/api/entries/history?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
Get entries for a date range (requires auth).

#### POST `/api/entries`
Create new entry (requires auth).

**Body:**
```json
{
  "entry_date": "2026-01-19",
  "food_description": "Chicken salad",
  "total_calories": 450,
  "entry_type": "text",
  "image_url": null,
  "ai_response": {...},
  "confidence": "medium"
}
```

#### PATCH `/api/entries/:id`
Update entry (requires auth).

**Body:**
```json
{
  "food_description": "Updated description",
  "total_calories": 500
}
```

#### DELETE `/api/entries/:id`
Delete entry (requires auth).

#### POST `/api/entries/upload`
Upload food image (requires auth).

**Body:** multipart/form-data with `image` field

**Response:**
```json
{
  "imageUrl": "http://localhost:3000/uploads/1-1705654321.jpg"
}
```

## Project Structure

```
backend/
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   └── entries.js        # Calorie entry routes
├── uploads/              # Uploaded images directory
├── .env.example          # Environment template
├── db.js                 # PostgreSQL connection
├── schema.sql            # Database schema
├── server.js             # Express server
└── package.json
```

## Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens for authentication
- CORS enabled for frontend URL only
- File upload restrictions (10MB, images only)
- SQL injection prevention via parameterized queries

## Development

### Database Management

Connect to PostgreSQL:
```bash
psql -U postgres -d calorie_calculator
```

View tables:
```sql
\dt
```

View users:
```sql
SELECT id, email, daily_calorie_goal FROM users;
```

View entries:
```sql
SELECT * FROM calorie_entries ORDER BY created_at DESC LIMIT 10;
```

### Testing Endpoints

Use curl or Postman:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get entries (use token from login)
curl http://localhost:3000/api/entries?date=2026-01-19 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
3. Set up SSL/TLS for HTTPS
4. Use environment variables for sensitive data
5. Enable database connection pooling
6. Add rate limiting middleware
7. Set up logging (e.g., Winston)
8. Configure reverse proxy (nginx)
9. Use process manager (PM2)

Example with PM2:
```bash
npm install -g pm2
pm2 start server.js --name calorie-api
pm2 save
pm2 startup
```

## Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

**Database connection failed:**
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

**CORS errors:**
- Verify `FRONTEND_URL` matches frontend origin
- Check browser console for specific error

## License

MIT
