<script setup lang="ts">
import SupportView from "~/views/SupportView.vue";
definePageMeta({
  layout: "dusk",
  alias: ["/help-center/tickets/show/:id"],
  auth: true,
  support: "ticket",
});
</script>

<template><SupportView /></template>
