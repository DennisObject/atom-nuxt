<script setup lang="ts">
import CommunityView from "~/views/CommunityView.vue";
definePageMeta({
  layout: "dusk",
  validate: (route) =>
    [
      "staff",
      "teams",
      "photos",
      "staff-applications",
      "team-applications",
    ].includes(String(route.params.section)),
  auth: true,
});
</script>

<template><CommunityView /></template>
