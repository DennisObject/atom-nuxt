<script setup lang="ts">
import SettingsView from "~/views/SettingsView.vue";
definePageMeta({
  layout: "dusk",
  validate: (route) =>
    ["account", "password", "two-factor", "session-logs"].includes(
      String(route.params.tab)
    ),
  auth: true,
  alias: ["/settings/:tab"],
});
</script>

<template><SettingsView /></template>
