<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string | null;
  icon?: string;
}>();
</script>

<template>
  <section
    class="card flex w-full flex-col gap-4 overflow-hidden rounded-lg pb-4 bg-[var(--panel)] text-[var(--text)] shadow-sm"
  >
    <header
      class="card-heading flex items-center gap-2 bg-[var(--header)] p-3 text-sm leading-5"
    >
      <ThemeIcon v-if="icon" :name="icon" />
      <div>
        <h2 class="text-sm font-semibold leading-5">{{ title }}</h2>
        <p
          v-if="subtitle"
          class="text-sm leading-5 text-[var(--text-secondary)]"
        >
          {{ subtitle }}
        </p>
      </div>
    </header>
    <div class="card-body flex h-full flex-col px-4"><slot /></div>
  </section>
</template>
