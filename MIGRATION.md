# Calorie Calculator - Migration from Supabase to Node.js Backend

## What Changed

### Removed
- ❌ Supabase client library (`@supabase/supabase-js`)
- ❌ Supabase Auth integration
- ❌ Supabase Storage for images
- ❌ Supabase PostgreSQL with RLS

### Added
- ✅ Custom Node.js/Express backend
- ✅ JWT-based authentication
- ✅ Direct PostgreSQL connection
- ✅ Local file storage for images
- ✅ REST API with axios

## Architecture Changes

### Before (Supabase)
```
Frontend → Supabase Client → Supabase Services
                              ├─ Auth
                              ├─ PostgreSQL (with RLS)
                              └─ Storage
```

### After (Node.js Backend)
```
Frontend → Axios → Express API → PostgreSQL
                    ├─ JWT Auth
                    ├─ Direct SQL Queries
                    └─ Local File Storage
```

## Key Differences

### Authentication
**Before:**
- Supabase Auth handled everything
- Session managed by Supabase
- RLS policies for security

**After:**
- JWT tokens in localStorage
- Manual session management
- API endpoint authorization checks

### Data Access
**Before:**
```typescript
const { data } = await supabase
  .from('calorie_entries')
  .select('*')
  .eq('user_id', userId)
```

**After:**
```typescript
const response = await api.get('/entries', {
  params: { date: '2026-01-19' }
})
```

### Image Upload
**Before:**
- Upload to Supabase Storage
- Get public URL
- RLS policies control access

**After:**
- Upload via multipart/form-data
- Store in `backend/uploads/`
- Serve as static files
- Access controlled by JWT

## Benefits of New Architecture

### Advantages
1. **Full Control**: Complete control over backend logic
2. **No Vendor Lock-in**: Not dependent on Supabase
3. **Cost**: No Supabase subscription needed
4. **Customization**: Easy to add custom business logic
5. **Learning**: Better understanding of full-stack development

### Trade-offs
1. **More Code**: Need to maintain auth/storage ourselves
2. **Deployment**: Need to deploy both frontend and backend
3. **Scaling**: Manual setup for load balancing
4. **Real-time**: Would need to add WebSockets manually

## File Changes Summary

### New Files
- `backend/` - Entire backend application
  - `server.js` - Express server
  - `db.js` - PostgreSQL connection
  - `routes/auth.js` - Authentication endpoints
  - `routes/entries.js` - Entry management endpoints
  - `middleware/auth.js` - JWT middleware
  - `schema.sql` - Database schema
  - `package.json` - Backend dependencies

### Modified Files
- `src/lib/api.ts` - NEW: Axios client (replaced supabase.ts)
- `src/stores/auth.ts` - Updated to use REST API
- `src/stores/calorie.ts` - Updated to use REST API
- `src/types/database.ts` - Updated type definitions
- `.env.local` - Changed to use API_URL instead of Supabase
- `package.json` - Removed Supabase, added axios

### Deleted Files
- `src/lib/supabase.ts`
- `supabase-schema.sql`

## Database Schema Changes

### Users Table
**Before (Supabase):**
```sql
id: UUID (FK to auth.users)
```

**After (PostgreSQL):**
```sql
id: SERIAL (auto-increment integer)
password_hash: VARCHAR(255)  -- Now storing passwords
```

### Calorie Entries Table
**Before:**
```sql
id: UUID
user_id: UUID
```

**After:**
```sql
id: SERIAL
user_id: INTEGER
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/calorie-goal` - Update goal

### Calorie Entries
- `GET /api/entries?date=YYYY-MM-DD` - Get entries
- `GET /api/entries/history?start_date=...&end_date=...` - Historical data
- `POST /api/entries` - Create entry
- `PATCH /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `POST /api/entries/upload` - Upload image

## Environment Variables

### Before
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_OPENAI_API_KEY=...
```

### After
```env
# Frontend (.env.local)
VITE_API_URL=http://localhost:3000/api
VITE_OPENAI_API_KEY=...

# Backend (backend/.env)
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calorie_calculator
DB_USER=postgres
DB_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Before (Supabase)
```bash
npm run dev  # Just frontend
```

### After (Node.js Backend)
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
npm run dev
```

Or use the convenience script:
```bash
# Windows
start.bat
```

## Deployment Considerations

### Supabase Version
- Deploy frontend to Vercel/Netlify
- Supabase handles backend

### Node.js Version
- Deploy frontend to Vercel/Netlify
- Deploy backend to:
  - Heroku
  - Railway
  - DigitalOcean
  - AWS/Azure/GCP
- Need PostgreSQL hosting:
  - Heroku Postgres
  - AWS RDS
  - DigitalOcean Managed Database

## Security Notes

### Supabase Version
- RLS policies enforced at database level
- Auth handled by Supabase
- Storage policies automatic

### Node.js Version
- JWT validation in middleware
- User ID from token used in queries
- No direct database access from frontend
- File uploads restricted by middleware

## Migration Checklist

If migrating from existing Supabase setup:

1. ✅ Export data from Supabase
2. ✅ Set up PostgreSQL locally
3. ✅ Run new schema
4. ✅ Import data (adjust UUIDs to integers)
5. ✅ Download images from Supabase Storage
6. ✅ Place images in `backend/uploads/`
7. ✅ Update image URLs in database
8. ✅ Test authentication
9. ✅ Test all CRUD operations
10. ✅ Verify OpenAI integration still works

## Future Enhancements

Possible improvements to the new backend:

1. **Redis** - Add caching layer
2. **Socket.io** - Real-time updates
3. **Rate Limiting** - Prevent abuse
4. **Email Service** - Password reset
5. **Cloud Storage** - S3/Azure for images
6. **Docker** - Containerization
7. **Logging** - Winston/Pino
8. **Testing** - Jest/Supertest
9. **API Documentation** - Swagger/OpenAPI
10. **CI/CD** - GitHub Actions

## Conclusion

The migration from Supabase to a custom Node.js backend provides:
- More control and customization
- Better learning opportunities
- No vendor lock-in
- Professional full-stack architecture

The application maintains all original features while giving you complete ownership of the technology stack.
