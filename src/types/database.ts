export interface AIResponse {
  items: AIFoodItem[]
  total_calories: number
  confidence: 'low' | 'medium' | 'high'
}

export interface AIFoodItem {
  name: string
  estimated_calories: number
}

export interface CalorieEntry {
  id: number
  user_id: number
  entry_date: string
  food_description: string
  total_calories: number
  entry_type: 'text' | 'image'
  image_url: string | null
  ai_response: AIResponse | null
  confidence: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: number
  email: string
  daily_calorie_goal: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  daily_calorie_goal: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface DailyStats {
  date: string
  goal: number
  consumed: number
  remaining: number
  entries: CalorieEntry[]
}
