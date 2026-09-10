<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{
  content: Extract<Data<"HomeWidget">, { type: "my-rooms" }>["content"];
}>();
const { t } = useLocale();
const roomColors: Record<string, string> = {
  open: "bg-green-100 dark:bg-green-900",
  invisible: "bg-green-100 dark:bg-green-900",
  locked: "bg-yellow-100 dark:bg-yellow-900",
  password: "bg-red-100 dark:bg-red-900",
};
</script>

<template>
  <div
    v-for="room in content"
    :key="room.id"
    class="flex items-center gap-2 border-b border-[var(--border)] p-1"
  >
    <span
      class="size-8 shrink-0 rounded"
      :class="roomColors[room.state]"
      :title="room.state"
    ></span>
    <div class="min-w-0">
      <strong class="block truncate text-xs">{{ room.name }}</strong>
      <p class="truncate text-[10px] text-gray-500">
        {{ room.description }}
      </p>
    </div>
  </div>
  <p v-if="!content.length" class="text-[var(--muted)]">
    {{ t("No rooms yet.") }}
  </p>
</template>
