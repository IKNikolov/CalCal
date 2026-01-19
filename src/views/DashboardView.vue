<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalorieStore } from '@/stores/calorie'
import { useAuthStore } from '@/stores/auth'
import AddEntryDialog from '@/components/AddEntryDialog.vue'
import EditEntryDialog from '@/components/EditEntryDialog.vue'
import type { CalorieEntry } from '@/types/database'

const calorieStore = useCalorieStore()
const authStore = useAuthStore()

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedEntry = ref<CalorieEntry | null>(null)
const loading = ref(false)

const dailyGoal = computed(() => authStore.profile?.daily_calorie_goal || 2000)
const totalCalories = computed(() =>
  calorieStore.entries.reduce((sum, entry) => sum + entry.total_calories, 0)
)
const remainingCalories = computed(() => dailyGoal.value - totalCalories.value)

const progressColor = computed(() => {
  const percentage = (totalCalories.value / dailyGoal.value) * 100
  if (percentage < 80) return 'success'
  if (percentage < 100) return 'warning'
  return 'error'
})

const progressPercentage = computed(() => {
  return Math.min((totalCalories.value / dailyGoal.value) * 100, 100)
})

onMounted(async () => {
  loading.value = true
  try {
    await calorieStore.fetchEntries()
  } finally {
    loading.value = false
  }
})

function openEditDialog(entry: CalorieEntry) {
  selectedEntry.value = entry
  showEditDialog.value = true
}

async function handleDelete(entryId: number) {
  if (confirm('Are you sure you want to delete this entry?')) {
    await calorieStore.deleteEntry(entryId)
  }
}

function getEntryTypeIcon(type: string) {
  return type === 'image' ? 'mdi-image' : 'mdi-text'
}

function getConfidenceColor(confidence: string | null) {
  switch (confidence) {
    case 'high':
      return 'success'
    case 'medium':
      return 'warning'
    case 'low':
      return 'error'
    default:
      return 'grey'
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Today's Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Daily Progress Card -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Daily Progress</v-card-title>
          <v-card-text>
            <div class="text-h4 mb-2">
              {{ totalCalories }} / {{ dailyGoal }} kcal
            </div>
            <v-progress-linear
              :model-value="progressPercentage"
              :color="progressColor"
              height="20"
              class="mb-4"
            >
              <template v-slot:default>
                <strong>{{ Math.round(progressPercentage) }}%</strong>
              </template>
            </v-progress-linear>

            <div class="d-flex justify-space-between">
              <div>
                <div class="text-caption">Consumed</div>
                <div class="text-h6">{{ totalCalories }} kcal</div>
              </div>
              <div>
                <div class="text-caption">Remaining</div>
                <div class="text-h6" :class="remainingCalories < 0 ? 'text-error' : 'text-success'">
                  {{ remainingCalories }} kcal
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-btn color="primary" block size="large" @click="showAddDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Add New Entry
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Entries List -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Today's Entries</span>
            <v-chip>{{ calorieStore.entries.length }} entries</v-chip>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

            <v-list v-else-if="calorieStore.entries.length > 0">
              <v-list-item
                v-for="entry in calorieStore.entries"
                :key="entry.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-icon :icon="getEntryTypeIcon(entry.entry_type)"></v-icon>
                </template>

                <v-list-item-title>{{ entry.food_description }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ entry.total_calories }} kcal
                  <v-chip
                    v-if="entry.confidence"
                    :color="getConfidenceColor(entry.confidence)"
                    size="x-small"
                    class="ml-2"
                  >
                    {{ entry.confidence }}
                  </v-chip>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn icon size="small" @click="openEditDialog(entry)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" color="error" @click="handleDelete(entry.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <v-alert v-else type="info" variant="tonal">
              No entries for today. Click "Add New Entry" to get started!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <AddEntryDialog v-model="showAddDialog" />
    <EditEntryDialog v-model="showEditDialog" :entry="selectedEntry" />
  </v-container>
</template>
