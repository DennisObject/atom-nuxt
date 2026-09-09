<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string | null;
  icon?: string;
}>();
const backgroundIcon = computed(() => {
  if (props.icon?.endsWith("-icon")) return props.icon;
  const icons: Record<string, string> = {
    speechbubble_icon: "chat-icon",
    community_icon: "hotel-icon",
    store_icon: "currency-icon",
    "exclamation-mark_icon": "lighthouse-icon",
    rules_icon: "article-icon",
  };
  return icons[props.icon || ""] || "hotel-icon";
});
</script>
<template>
  <section class="card atom-card">
    <header class="card-heading">
      <div v-if="icon" class="card-icon" :class="backgroundIcon"></div>
      <div>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </header>
    <div class="card-body"><slot /></div>
  </section>
</template>
