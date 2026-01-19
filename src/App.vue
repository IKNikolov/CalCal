<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <v-app>
    <v-app-bar v-if="authStore.isAuthenticated" color="primary" prominent>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>Calorie Calculator</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn to="/dashboard" text>Dashboard</v-btn>
      <v-btn to="/history" text>History</v-btn>
      <v-btn to="/profile" text>Profile</v-btn>
      <v-btn @click="authStore.signOut" text>Logout</v-btn>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
