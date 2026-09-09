<script setup lang="ts">
import ShopView from "~/views/ShopView.vue";
definePageMeta({ layout: "dusk", alias: ["/shop/:category"], auth: true });
</script>

<template><ShopView /></template>
