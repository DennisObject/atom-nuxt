<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{
  content: Extract<Data<"HomeWidget">, { type: "my-rating" }>["content"];
  busy: boolean;
  visitor: boolean;
  editing: boolean;
}>();
const emit = defineEmits<{ rate: [value: number] }>();
const { t } = useLocale();
</script>

<template>
  <div class="flex flex-col items-center gap-2 p-2 text-xs">
    <strong>
      {{
        t("Average rating: :n", {
          n: Number(content.average).toFixed(1),
        })
      }}
    </strong>
    <div class="flex gap-1">
      <button
        v-for="value in 5"
        :key="value"
        class="min-h-0 border-0 bg-transparent p-0 enabled:hover:text-yellow-300"
        :class="
          content.average >= value
            ? 'text-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        "
        :disabled="busy || !visitor || editing"
        :aria-label="t('Rate :n stars', { n: value })"
        @click="emit('rate', value)"
      >
        <svg
          class="size-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </button>
    </div>
    <div class="flex flex-col items-center text-gray-500">
      <span>
        {{ t(":n votes total", { n: content.total }) }}
      </span>
      <span class="text-[var(--text-subtle)]">
        {{ t("(:n users voted 4 or better)", { n: content.positive }) }}
      </span>
    </div>
  </div>
</template>
