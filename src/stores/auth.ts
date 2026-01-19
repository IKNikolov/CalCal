import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/lib/api'
import type { User, UserProfile, AuthResponse } from '@/types/database'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  async function initialize() {
    try {
      loading.value = true
      
      if (token.value) {
        // Fetch current user
        const response = await api.get('/auth/me')
        user.value = response.data
        profile.value = response.data
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      token.value = null
      localStorage.removeItem('auth_token')
    } finally {
      loading.value = false
    }
  }

  async function loadProfile() {
    if (!token.value) return

    try {
      const response = await api.get('/auth/me')
      profile.value = response.data
      user.value = response.data
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  async function signUp(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password
    })

    token.value = response.data.token
    user.value = response.data.user
    profile.value = { ...response.data.user, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    localStorage.setItem('auth_token', response.data.token)
    
    return response.data
  }

  async function signIn(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    })

    token.value = response.data.token
    user.value = response.data.user
    profile.value = { ...response.data.user, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    localStorage.setItem('auth_token', response.data.token)
    
    return response.data
  }

  async function signOut() {
    token.value = null
    user.value = null
    profile.value = null
    localStorage.removeItem('auth_token')
  }

  async function updateCalorieGoal(goal: number) {
    if (!user.value) throw new Error('Not authenticated')

    const response = await api.patch('/auth/calorie-goal', {
      daily_calorie_goal: goal
    })

    profile.value = response.data
    if (user.value) {
      user.value.daily_calorie_goal = goal
    }
    return response.data
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    initialize,
    loadProfile,
    signUp,
    signIn,
    signOut,
    updateCalorieGoal
  }
})
