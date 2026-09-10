<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string | null;
  icon?: string;
}>();

const backgroundIcon = computed(() => {
  if (props.icon?.endsWith("-icon")) {
    return props.icon;
  }

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
  <section
    class="card flex w-full flex-col gap-y-4 overflow-hidden rounded bg-white pb-3 shadow-sm dark:bg-gray-800"
  >
    <header
      class="card-heading flex gap-x-2 border-b border-current bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
    >
      <ThemeIcon v-if="icon" :name="backgroundIcon" />
      <div class="flex flex-col justify-center text-sm">
        <h2 class="text-sm font-semibold text-black dark:text-gray-300">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-sm dark:text-gray-500">
          {{ subtitle }}
        </p>
      </div>
    </header>
    <div class="card-body flex h-full flex-col px-3"><slot /></div>
  </section>
</template>
