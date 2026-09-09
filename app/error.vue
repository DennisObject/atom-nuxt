<script setup lang="ts">
import type { NuxtError } from "#app";
defineProps<{ error: NuxtError }>();
</script>
<template>
  <main class="container main-content">
    <h1>
      {{
        error.statusCode === 404
          ? "Page not found"
          : "The hotel is temporarily unavailable"
      }}
    </h1>
    <p>
      {{
        error.statusCode === 404
          ? "We could not find the page you were looking for."
          : "Please try again in a moment."
      }}
    </p>
    <button @click="clearError({ redirect: '/' })">Back home</button>
  </main>
</template>
