<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  headingId: string;
}>();
</script>

<template>
  <section
    class="flex w-full flex-col gap-y-4 overflow-hidden rounded-lg p-3"
    :aria-labelledby="headingId"
  >
    <header class="flex gap-x-2">
      <ThemeIcon :name="icon" />

      <div class="flex flex-col">
        <h2
          :id="headingId"
          class="text-base font-semibold text-black dark:text-gray-200"
        >
          {{ title }}
        </h2>

        <p class="dark:text-gray-500">{{ subtitle }}</p>
      </div>
    </header>

    <slot />
  </section>
</template>
