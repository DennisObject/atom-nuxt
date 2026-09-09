<script setup lang="ts">
import MeView from "~/views/MeView.vue";
definePageMeta({ layout: "dusk", auth: true, alias: ["/me"] });
</script>

<template><MeView /></template>
