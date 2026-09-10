<script setup lang="ts">
import { MeView } from "#components";

definePageMeta({ auth: true, alias: ["/me"] });
</script>

<template><MeView /></template>
