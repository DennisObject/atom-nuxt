<script setup lang="ts">
import StatusView from "~/views/StatusView.vue";
definePageMeta({ layout: "default" });
setResponseStatus(404);
useSeoMeta({ title: "Page not found" });
</script>

<template><StatusView /></template>
