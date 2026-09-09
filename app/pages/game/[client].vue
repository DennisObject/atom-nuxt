<script setup lang="ts">
import ClientView from "~/views/ClientView.vue";
definePageMeta({
  layout: false,
  validate: (route) => ["nitro", "flash"].includes(String(route.params.client)),
  auth: true,
});
</script>

<template><ClientView /></template>
