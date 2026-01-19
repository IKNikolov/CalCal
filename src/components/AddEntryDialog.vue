<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCalorieStore } from '@/stores/calorie'
import { estimateCaloriesFromText, estimateCaloriesFromImage } from '@/services/openai'
import type { AIResponse } from '@/types/database'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const calorieStore = useCalorieStore()

const inputType = ref<'text' | 'image'>('text')
const textInput = ref('')
const imageFile = ref<File | null>(null)
const loading = ref(false)
const error = ref('')

const aiResponse = ref<AIResponse | null>(null)
const imagePreview = ref<string | null>(null)

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  }
)

function resetForm() {
  inputType.value = 'text'
  textInput.value = ''
  imageFile.value = null
  imagePreview.value = null
  aiResponse.value = null
  error.value = ''
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    imageFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function analyzeInput() {
  if (inputType.value === 'text' && !textInput.value) {
    error.value = 'Please enter food description'
    return
  }

  if (inputType.value === 'image' && !imageFile.value) {
    error.value = 'Please select an image'
    return
  }

  try {
    loading.value = true
    error.value = ''

    if (inputType.value === 'text') {
      aiResponse.value = await estimateCaloriesFromText(textInput.value)
    } else if (imageFile.value) {
      // Upload image first
      const imageUrl = await calorieStore.uploadImage(imageFile.value)
      aiResponse.value = await estimateCaloriesFromImage(imageUrl)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to analyze input'
  } finally {
    loading.value = false
  }
}

async function saveEntry() {
  if (!aiResponse.value) return

  try {
    loading.value = true
    error.value = ''

    let imageUrl: string | null = null
    if (inputType.value === 'image' && imageFile.value) {
      imageUrl = await calorieStore.uploadImage(imageFile.value)
    }

    const foodDescription =
      inputType.value === 'text'
        ? textInput.value
        : aiResponse.value.items.map((item) => item.name).join(', ')

    await calorieStore.addEntry({
      entry_date: new Date().toISOString().split('T')[0] as string,
      food_description: foodDescription,
      total_calories: aiResponse.value.total_calories,
      entry_type: inputType.value,
      image_url: imageUrl,
      ai_response: aiResponse.value,
      confidence: aiResponse.value.confidence
    })

    emit('update:modelValue', false)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save entry'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title class="text-h5">Add Calorie Entry</v-card-title>

      <v-card-text>
        <v-tabs v-model="inputType" class="mb-4">
          <v-tab value="text">Text Input</v-tab>
          <v-tab value="image">Image Upload</v-tab>
        </v-tabs>

        <!-- Text Input -->
        <div v-if="inputType === 'text'">
          <v-textarea
            v-model="textInput"
            label="Food Description"
            placeholder="e.g., 2 eggs, slice of bread, cheese"
            rows="3"
            :disabled="!!aiResponse"
          ></v-textarea>
        </div>

        <!-- Image Input -->
        <div v-else>
          <v-file-input
            label="Upload Food Image"
            accept="image/*"
            prepend-icon="mdi-camera"
            @change="handleImageChange"
            :disabled="!!aiResponse"
          ></v-file-input>

          <v-img
            v-if="imagePreview"
            :src="imagePreview"
            max-height="300"
            class="mt-4"
          ></v-img>
        </div>

        <!-- AI Response -->
        <v-card v-if="aiResponse" class="mt-4" variant="outlined">
          <v-card-title class="text-subtitle-1">AI Analysis Result</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item v-for="(item, index) in aiResponse.items" :key="index">
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.estimated_calories }} kcal</v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider class="my-2"></v-divider>

            <div class="d-flex justify-space-between align-center">
              <div>
                <strong>Total:</strong> {{ aiResponse.total_calories }} kcal
              </div>
              <v-chip :color="aiResponse.confidence === 'high' ? 'success' : 'warning'" size="small">
                {{ aiResponse.confidence }} confidence
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-alert v-if="error" type="error" class="mt-4">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="close">Cancel</v-btn>
        <v-btn
          v-if="!aiResponse"
          color="primary"
          :loading="loading"
          @click="analyzeInput"
        >
          Analyze with AI
        </v-btn>
        <v-btn v-else color="success" :loading="loading" @click="saveEntry">
          Save Entry
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
