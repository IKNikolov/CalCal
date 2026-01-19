<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const editingGoal = ref(false)
const newGoal = ref(authStore.profile?.daily_calorie_goal || 2000)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const currentGoal = computed(() => authStore.profile?.daily_calorie_goal || 2000)

async function saveGoal() {
  try {
    loading.value = true
    error.value = ''
    success.value = false

    await authStore.updateCalorieGoal(newGoal.value)

    success.value = true
    editingGoal.value = false

    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update calorie goal'
  } finally {
    loading.value = false
  }
}

function startEditing() {
  newGoal.value = currentGoal.value
  editingGoal.value = true
}

function cancelEditing() {
  editingGoal.value = false
  newGoal.value = currentGoal.value
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card>
          <v-card-title class="text-h5 primary white--text">
            User Profile
          </v-card-title>

          <v-card-text class="pt-6">
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-divider></v-divider>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Daily Calorie Goal</v-list-item-title>
                  <v-list-item-subtitle v-if="!editingGoal">
                    {{ currentGoal }} kcal
                  </v-list-item-subtitle>

                  <v-text-field
                    v-else
                    v-model.number="newGoal"
                    type="number"
                    label="Daily Calorie Goal"
                    suffix="kcal"
                    :rules="[(v) => v > 0 || 'Goal must be positive']"
                    class="mt-2"
                  ></v-text-field>
                </v-list-item-content>

                <v-list-item-action v-if="!editingGoal">
                  <v-btn icon @click="startEditing">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" class="mt-4">
              Calorie goal updated successfully!
            </v-alert>
          </v-card-text>

          <v-card-actions v-if="editingGoal">
            <v-spacer></v-spacer>
            <v-btn @click="cancelEditing">Cancel</v-btn>
            <v-btn color="primary" :loading="loading" @click="saveGoal">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
