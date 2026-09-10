<script setup lang="ts">
defineProps<{
  name?: string | null;
  description?: string | null;
  badge?: string | null;
  color?: string | null;
}>();

const { safeUrl } = useApi();

const { session } = useSession();
</script>

<template>
  <header
    class="mb-4 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--header)] p-3"
  >
    <span
      class="grid gap-4 size-[50px] shrink-0 place-items-center rounded-full"
      :style="{ backgroundColor: color || '#327fa8' }"
    >
      <img
        v-if="badge"
        :src="safeUrl(`${session.bootstrap.assets?.badge || ''}/${badge}.gif`)"
        alt=""
      />
    </span>

    <div>
      <h2 class="text-sm font-semibold text-[var(--text-secondary)]">
        {{ name }}
        <slot />
      </h2>

      <p class="text-sm text-[var(--text-dim)]">{{ description }}</p>
    </div>
  </header>
</template>
