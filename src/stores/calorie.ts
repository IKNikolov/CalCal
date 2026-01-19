import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/lib/api'
import type { CalorieEntry, DailyStats } from '@/types/database'
import { useAuthStore } from './auth'

export const useCalorieStore = defineStore('calorie', () => {
  const entries = ref<CalorieEntry[]>([])
  const loading = ref(false)
  const currentDate = ref(new Date().toISOString().split('T')[0])

  async function fetchEntries(date?: string) {
    const authStore = useAuthStore()
    if (!authStore.user) return

    try {
      loading.value = true
      const targetDate = date || currentDate.value

      const response = await api.get('/entries', {
        params: { date: targetDate }
      })

      entries.value = response.data || []
    } catch (error) {
      console.error('Error fetching entries:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addEntry(entry: Omit<CalorieEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('Not authenticated')

    try {
      const response = await api.post('/entries', entry)

      entries.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Error adding entry:', error)
      throw error
    }
  }

  async function updateEntry(id: number, updates: Partial<CalorieEntry>) {
    try {
      const response = await api.patch(`/entries/${id}`, updates)

      const index = entries.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        entries.value[index] = response.data
      }

      return response.data
    } catch (error) {
      console.error('Error updating entry:', error)
      throw error
    }
  }

  async function deleteEntry(id: number) {
    try {
      await api.delete(`/entries/${id}`)

      entries.value = entries.value.filter((e) => e.id !== id)
    } catch (error) {
      console.error('Error deleting entry:', error)
      throw error
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('Not authenticated')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await api.post('/entries/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  async function getDailyStats(date?: string): Promise<DailyStats> {
    const authStore = useAuthStore()
    const targetDate = date || currentDate.value

    await fetchEntries(targetDate)

    const totalCalories = entries.value.reduce((sum, entry) => sum + entry.total_calories, 0)
    const goal = authStore.profile?.daily_calorie_goal || 2000

    return {
      date: targetDate as string,
      goal,
      consumed: totalCalories,
      remaining: goal - totalCalories,
      entries: entries.value
    }
  }

  async function getHistoricalData(startDate: string, endDate: string) {
    const authStore = useAuthStore()
    if (!authStore.user) return []

    try {
      const response = await api.get('/entries/history', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      })

      return response.data || []
    } catch (error) {
      console.error('Error fetching historical data:', error)
      throw error
    }
  }

  return {
    entries,
    loading,
    currentDate,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    uploadImage,
    getDailyStats,
    getHistoricalData
  }
})
