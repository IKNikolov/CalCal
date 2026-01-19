<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCalorieStore } from '@/stores/calorie'
import type { CalorieEntry } from '@/types/database'

const props = defineProps<{
  modelValue: boolean
  entry: CalorieEntry | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const calorieStore = useCalorieStore()

const foodDescription = ref('')
const totalCalories = ref(0)
const loading = ref(false)
const error = ref('')

watch(
  () => props.entry,
  (newEntry) => {
    if (newEntry) {
      foodDescription.value = newEntry.food_description
      totalCalories.value = newEntry.total_calories
    }
  },
  { immediate: true }
)

async function saveChanges() {
  if (!props.entry) return

  if (!foodDescription.value || totalCalories.value <= 0) {
    error.value = 'Please fill in all fields correctly'
    return
  }

  try {
    loading.value = true
    error.value = ''

    await calorieStore.updateEntry(props.entry.id, {
      food_description: foodDescription.value,
      total_calories: totalCalories.value
    })

    emit('update:modelValue', false)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update entry'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500">
    <v-card v-if="entry">
      <v-card-title class="text-h5">Edit Entry</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="foodDescription"
          label="Food Description"
          :rules="[(v) => !!v || 'Description is required']"
        ></v-text-field>

        <v-text-field
          v-model.number="totalCalories"
          label="Total Calories"
          type="number"
          suffix="kcal"
          :rules="[(v) => v > 0 || 'Calories must be positive']"
        ></v-text-field>

        <v-chip :color="entry.entry_type === 'image' ? 'primary' : 'secondary'" class="mr-2">
          <v-icon left>{{ entry.entry_type === 'image' ? 'mdi-image' : 'mdi-text' }}</v-icon>
          {{ entry.entry_type }}
        </v-chip>

        <v-chip v-if="entry.confidence" :color="entry.confidence === 'high' ? 'success' : 'warning'">
          {{ entry.confidence }} confidence
        </v-chip>

        <v-img
          v-if="entry.image_url"
          :src="entry.image_url"
          max-height="200"
          class="mt-4"
        ></v-img>

        <v-alert v-if="error" type="error" class="mt-4">
          {{ error }}
        </v-alert>

        <v-alert type="info" variant="tonal" class="mt-4">
          Note: Editing an entry will not re-analyze with AI. To get a new AI estimate, delete this
          entry and create a new one.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="close">Cancel</v-btn>
        <v-btn color="primary" :loading="loading" @click="saveChanges">Save Changes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
