# Project Architecture & Implementation Guide

## Overview

This is a full-stack AI-powered calorie tracking application built with:
- **Frontend**: Vue 3 (Composition API) + TypeScript + Vuetify 3
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI API (GPT-4o & GPT-4o-mini)

## Key Design Decisions

### 1. Architecture Pattern
- **Composition API**: Using Vue 3's Composition API for better code organization and TypeScript support
- **Pinia Stores**: Centralized state management for auth and calorie data
- **Service Layer**: Separate services for OpenAI API calls

### 2. Type Safety
- Strict TypeScript configuration
- Database types defined in `src/types/database.ts`
- Type-safe Supabase client with generic types

### 3. Security Model
- Row Level Security (RLS) on all Supabase tables
- User data isolation at database level
- Protected routes with Vue Router guards
- Secure storage bucket policies

## Project Structure Explained

```
src/
├── components/              # Reusable Vue components
│   ├── AddEntryDialog.vue  # Modal for adding new calorie entries
│   └── EditEntryDialog.vue # Modal for editing existing entries
│
├── lib/                     # Core library files
│   └── supabase.ts         # Supabase client initialization
│
├── plugins/                 # Vue plugins
│   └── vuetify.ts          # Vuetify configuration and theming
│
├── router/                  # Vue Router configuration
│   └── index.ts            # Route definitions and guards
│
├── services/                # External service integrations
│   └── openai.ts           # OpenAI API service with prompts
│
├── stores/                  # Pinia state management
│   ├── auth.ts             # Authentication state and actions
│   └── calorie.ts          # Calorie entries state and actions
│
├── types/                   # TypeScript type definitions
│   └── database.ts         # Database schema types
│
├── views/                   # Page components
│   ├── DashboardView.vue   # Main dashboard with today's data
│   ├── HistoryView.vue     # Historical data view
│   ├── LoginView.vue       # Login page
│   ├── ProfileView.vue     # User profile and settings
│   └── RegisterView.vue    # Registration page
│
├── App.vue                  # Root component with app bar
└── main.ts                  # Application entry point
```

## Data Flow

### Authentication Flow
1. User enters credentials in LoginView/RegisterView
2. Component calls auth store methods (signIn/signUp)
3. Auth store communicates with Supabase Auth
4. On success, user state is updated and router redirects
5. Router guard checks authentication on route change

### Calorie Entry Flow (Text)
1. User opens AddEntryDialog from Dashboard
2. User enters food description
3. Component calls OpenAI service with text
4. OpenAI returns structured JSON with calorie estimates
5. User reviews and confirms
6. Component calls calorie store to save entry
7. Store saves to Supabase and updates local state
8. Dashboard automatically reflects new total

### Calorie Entry Flow (Image)
1. User opens AddEntryDialog and selects image
2. Image is uploaded to Supabase Storage
3. Public URL is generated
4. URL is sent to OpenAI Vision API
5. AI analyzes image and returns calorie data
6. Rest of flow matches text flow

## State Management

### Auth Store (`stores/auth.ts`)
**State:**
- `user`: Current authenticated user
- `session`: Active session
- `profile`: User profile from database
- `loading`: Authentication initialization status

**Actions:**
- `initialize()`: Load auth state on app start
- `signUp()`: Create new account
- `signIn()`: Authenticate user
- `signOut()`: End session
- `updateCalorieGoal()`: Update daily goal

### Calorie Store (`stores/calorie.ts`)
**State:**
- `entries`: Array of calorie entries
- `loading`: Data fetch status
- `currentDate`: Currently viewed date

**Actions:**
- `fetchEntries()`: Load entries for a date
- `addEntry()`: Create new entry
- `updateEntry()`: Modify existing entry
- `deleteEntry()`: Remove entry
- `uploadImage()`: Upload food image
- `getDailyStats()`: Calculate daily totals
- `getHistoricalData()`: Fetch date range

## Database Schema

### profiles table
```sql
id: UUID (FK to auth.users)
email: TEXT
daily_calorie_goal: INTEGER (default 2000)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

**RLS Policies:**
- Users can view/update their own profile only

### calorie_entries table
```sql
id: UUID (primary key)
user_id: UUID (FK to auth.users)
entry_date: DATE
food_description: TEXT
total_calories: INTEGER
entry_type: TEXT ('text' | 'image')
image_url: TEXT (nullable)
ai_response: JSONB (nullable)
confidence: TEXT (nullable)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

**RLS Policies:**
- Users can CRUD their own entries only

### Storage: food-images bucket
**Policies:**
- Users can upload/view/delete files in their own folder only
- Folder structure: `{user_id}/{timestamp}.{ext}`

## AI Integration

### System Prompt
The AI is instructed to:
1. Only estimate calories (no other tasks)
2. Return valid JSON only
3. Use specific structure with items array
4. Include confidence level
5. Be conservative with estimates

### Models Used
- **GPT-4o-mini**: Text-based calorie estimation (faster, cheaper)
- **GPT-4o**: Image-based analysis (vision support required)

### Response Format
```json
{
  "items": [
    { "name": "Food Item", "estimated_calories": 150 }
  ],
  "total_calories": 150,
  "confidence": "medium"
}
```

## Component Communication

### Props & Events Pattern
Components use standard Vue props down, events up:
- `v-model` for dialog visibility
- Custom events for actions
- Props for data passing

### Example: AddEntryDialog
```vue
<!-- Usage -->
<AddEntryDialog v-model="showDialog" @saved="handleSaved" />

<!-- Component -->
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
```

## Routing & Navigation

### Route Guards
Router checks authentication before each navigation:
```typescript
router.beforeEach((to, from, next) => {
  if (requiresAuth && !authenticated) next('/login')
  else if (isLoginPage && authenticated) next('/dashboard')
  else next()
})
```

### Protected Routes
- `/dashboard` - Main app view
- `/history` - Historical data
- `/profile` - User settings

### Public Routes
- `/login` - Authentication
- `/register` - Account creation

## Error Handling

### API Errors
All async operations wrapped in try-catch:
```typescript
try {
  await apiCall()
} catch (e) {
  error.value = e instanceof Error ? e.message : 'Operation failed'
}
```

### User Feedback
- Error alerts shown inline
- Success messages for confirmations
- Loading states during async operations

## Performance Considerations

### Optimizations
1. **Lazy Loading**: Routes loaded on demand
2. **Efficient Queries**: Supabase queries filtered by user_id and date
3. **Local State**: Dashboard uses store state to avoid re-fetches
4. **Image Upload**: Direct to storage, not through API

### Future Improvements
1. Add backend proxy for OpenAI calls
2. Implement caching for frequently accessed data
3. Add pagination for history view
4. Optimize image compression before upload
5. Add offline support with service workers

## Testing Strategy (Not Implemented)

### Recommended Tests
1. **Unit Tests**: Store actions, services
2. **Component Tests**: User interactions
3. **E2E Tests**: Complete user flows
4. **Integration Tests**: Supabase + OpenAI

### Test Tools
- Vitest for unit/component tests
- Playwright/Cypress for E2E
- Mock Supabase client for isolated tests

## Deployment Checklist

Before production deployment:

1. ✅ Set up environment variables in hosting platform
2. ✅ Create backend proxy for OpenAI API key
3. ✅ Enable email confirmation in Supabase
4. ✅ Configure CORS in Supabase settings
5. ✅ Set up custom domain
6. ✅ Enable HTTPS
7. ✅ Test all authentication flows
8. ✅ Test file uploads with storage limits
9. ✅ Set up error monitoring (e.g., Sentry)
10. ✅ Configure analytics (optional)

## Common Issues & Solutions

### Issue: Auth not persisting
**Solution**: Supabase auto-persists to localStorage. Check browser settings.

### Issue: Images not loading
**Solution**: Verify storage bucket is public or use signed URLs.

### Issue: OpenAI rate limits
**Solution**: Implement request queuing or upgrade OpenAI plan.

### Issue: Slow queries
**Solution**: Add indexes to frequently queried columns (user_id, entry_date).

## Environment Variables

Required variables in `.env.local`:
```env
VITE_SUPABASE_URL=          # From Supabase project settings
VITE_SUPABASE_ANON_KEY=     # From Supabase API settings
VITE_OPENAI_API_KEY=        # From OpenAI platform
```

**Note**: `VITE_` prefix required for Vite to expose to client.

## Development Workflow

1. Start dev server: `npm run dev`
2. Make changes to components/stores
3. Hot reload provides instant feedback
4. Check browser console for errors
5. Use Vue DevTools for debugging state

## Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforces Vue and TypeScript best practices
- **Prettier**: Auto-formatting on save
- **Naming**: PascalCase for components, camelCase for variables

## Security Notes

⚠️ **Important**: OpenAI API key is exposed in browser. This is acceptable for development/demos but **NOT recommended for production**.

**Production Solution**: Create a backend API endpoint that:
1. Receives food description/image from frontend
2. Calls OpenAI API server-side with secret key
3. Returns AI response to frontend

Example structure:
```
Frontend → Backend API → OpenAI API
                ↓
          (API key stays server-side)
```

## Contributing Guidelines (If Open Source)

1. Fork repository
2. Create feature branch
3. Follow existing code style
4. Add TypeScript types for new features
5. Test authentication flows
6. Submit pull request

## License

MIT License - See LICENSE file for details

---

Last Updated: January 2026
