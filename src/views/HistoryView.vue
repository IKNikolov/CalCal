<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalorieStore } from '@/stores/calorie'
import { useAuthStore } from '@/stores/auth'
import type { CalorieEntry } from '@/types/database'

const calorieStore = useCalorieStore()
const authStore = useAuthStore()

const historicalEntries = ref<CalorieEntry[]>([])
const loading = ref(false)

const dailyGoal = computed(() => authStore.profile?.daily_calorie_goal || 2000)

interface DailySummary {
  date: string
  totalCalories: number
  entryCount: number
  goal: number
  status: 'under' | 'met' | 'exceeded'
}

const dailySummaries = computed(() => {
  const summaryMap = new Map<string, DailySummary>()

  historicalEntries.value.forEach((entry) => {
    const date = entry.entry_date
    if (!summaryMap.has(date)) {
      summaryMap.set(date, {
        date,
        totalCalories: 0,
        entryCount: 0,
        goal: dailyGoal.value,
        status: 'under'
      })
    }

    const summary = summaryMap.get(date)!
    summary.totalCalories += entry.total_calories
    summary.entryCount += 1
  })

  // Determine status
  summaryMap.forEach((summary) => {
    const percentage = (summary.totalCalories / summary.goal) * 100
    if (percentage < 95) {
      summary.status = 'under'
    } else if (percentage <= 105) {
      summary.status = 'met'
    } else {
      summary.status = 'exceeded'
    }
  })

  return Array.from(summaryMap.values()).sort((a, b) => b.date.localeCompare(a.date))
})

onMounted(async () => {
  await loadHistory()
})

async function loadHistory() {
  loading.value = true
  try {
    // Load last 30 days
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    historicalEntries.value = await calorieStore.getHistoricalData(startDate, endDate)
  } finally {
    loading.value = false
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'under':
      return 'warning'
    case 'met':
      return 'success'
    case 'exceeded':
      return 'error'
    default:
      return 'grey'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'under':
      return 'mdi-arrow-down'
    case 'met':
      return 'mdi-check'
    case 'exceeded':
      return 'mdi-arrow-up'
    default:
      return 'mdi-minus'
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getEntriesForDate(date: string) {
  return historicalEntries.value.filter((entry) => entry.entry_date === date)
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">History & Progress</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Last 30 Days</v-card-title>

          <v-card-text>
            <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

            <v-list v-else-if="dailySummaries.length > 0">
              <v-expansion-panels>
                <v-expansion-panel v-for="summary in dailySummaries" :key="summary.date">
                  <v-expansion-panel-title>
                    <div class="d-flex justify-space-between align-center w-100 pr-4">
                      <div>
                        <div class="text-h6">{{ formatDate(summary.date) }}</div>
                        <div class="text-caption">{{ summary.entryCount }} entries</div>
                      </div>

                      <div class="d-flex align-center">
                        <div class="text-right mr-4">
                          <div class="text-subtitle-1">
                            {{ summary.totalCalories }} / {{ summary.goal }} kcal
                          </div>
                          <div class="text-caption">
                            {{ Math.round((summary.totalCalories / summary.goal) * 100) }}% of goal
                          </div>
                        </div>

                        <v-chip :color="getStatusColor(summary.status)" size="small">
                          <v-icon :icon="getStatusIcon(summary.status)" size="small"></v-icon>
                          {{ summary.status }}
                        </v-chip>
                      </div>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <v-list density="compact">
                      <v-list-item
                        v-for="entry in getEntriesForDate(summary.date)"
                        :key="entry.id"
                      >
                        <template v-slot:prepend>
                          <v-icon
                            :icon="entry.entry_type === 'image' ? 'mdi-image' : 'mdi-text'"
                          ></v-icon>
                        </template>

                        <v-list-item-title>{{ entry.food_description }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ entry.total_calories }} kcal
                          <v-chip
                            v-if="entry.confidence"
                            size="x-small"
                            class="ml-2"
                          >
                            {{ entry.confidence }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-list>

            <v-alert v-else type="info" variant="tonal">
              No history available yet. Start tracking your calories to see your progress!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Summary Stats -->
    <v-row v-if="dailySummaries.length > 0" class="mt-4">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="text-h4">{{ dailySummaries.length }}</div>
            <div class="text-caption">Days Tracked</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="text-h4">
              {{
                Math.round(
                  dailySummaries.reduce((sum, s) => sum + s.totalCalories, 0) /
                    dailySummaries.length
                )
              }}
            </div>
            <div class="text-caption">Avg Daily Calories</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="text-h4">
              {{ dailySummaries.filter((s) => s.status === 'met').length }}
            </div>
            <div class="text-caption">Goals Met</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
