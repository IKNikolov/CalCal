<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === password.value || 'Passwords must match'
]

async function handleRegister() {
  if (!email.value || !password.value || password.value !== confirmPassword.value) return

  try {
    loading.value = true
    error.value = ''
    await authStore.signUp(email.value, password.value)
    success.value = true

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to register'
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Register for Calorie Calculator</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                label="Confirm Password"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                required
              ></v-text-field>

              <v-alert v-if="error" type="error" class="mt-4">
                {{ error }}
              </v-alert>

              <v-alert v-if="success" type="success" class="mt-4">
                Registration successful! Redirecting to login...
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="goToLogin">Back to Login</v-btn>
            <v-btn color="primary" :loading="loading" :disabled="success" @click="handleRegister"
              >Register</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
