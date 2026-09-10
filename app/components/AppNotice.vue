<script setup lang="ts">
const props = defineProps<{
  error?: string;
  success?: string;
  fields?: Record<string, string[]>;
  teleport?: boolean;
}>();

const { t } = useLocale();

const fieldMessages = computed(() =>
  [...new Set(Object.values(props.fields || {}).flat())].filter(
    (message) => message && message !== props.error,
  ),
);

const dismissed = reactive({ error: false, success: false });

watch(
  () => props.error,
  () => {
    dismissed.error = false;
  },
);

watch(
  () => props.success,
  () => {
    dismissed.success = false;
  },
);
</script>

<template>
  <Teleport to="body" :disabled="teleport === false">
    <div
      v-if="(error && !dismissed.error) || (success && !dismissed.success)"
      class="pointer-events-none fixed top-4 right-4 z-100 flex w-80 max-w-[calc(100vw-32px)] flex-col gap-2"
      aria-live="polite"
    >
      <template v-for="kind in ['error', 'success'] as const" :key="kind">
        <div
          v-if="props[kind] && !dismissed[kind]"
          class="group pointer-events-auto relative m-0 flex items-start gap-3 overflow-hidden rounded-lg border-0 bg-[var(--panel)] p-3 pr-9 text-sm leading-5 shadow-lg"
          :data-kind="kind"
          :role="kind === 'error' ? 'alert' : 'status'"
        >
          <svg
            class="mt-0.5 size-5 shrink-0"
            :class="kind === 'error' ? 'text-rose-500' : 'text-emerald-500'"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              v-if="kind === 'success'"
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clip-rule="evenodd"
            />

            <path
              v-else
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 0 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 0 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
              clip-rule="evenodd"
            />
          </svg>

          <div>
            {{ props[kind] }}
            <ul v-if="kind === 'error' && fieldMessages.length">
              <li v-for="message in fieldMessages" :key="message">
                {{ message }}
              </li>
            </ul>
          </div>

          <button
            class="absolute top-[7px] right-2 border-0 bg-transparent p-0 text-xl font-normal text-[var(--text-subtle)]"
            :aria-label="t('Close')"
            @click="dismissed[kind] = true"
          >
            ×
          </button>

          <div
            class="absolute bottom-0 left-0 h-0.5 animate-[notice-progress_4s_linear_forwards] group-hover:[animation-play-state:paused]"
            :class="kind === 'error' ? 'bg-rose-500' : 'bg-emerald-500'"
            @animationend="dismissed[kind] = true"
          ></div>
        </div>
      </template>
    </div>
  </Teleport>
</template>
