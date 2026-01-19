<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [(v: string) => !!v || 'Password is required']

async function handleLogin() {
  if (!email.value || !password.value) return

  try {
    loading.value = true
    error.value = ''
    await authStore.signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to sign in'
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login to Calorie Calculator</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
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

              <v-alert v-if="error" type="error" class="mt-4">
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="goToRegister">Register</v-btn>
            <v-btn color="primary" :loading="loading" @click="handleLogin">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
