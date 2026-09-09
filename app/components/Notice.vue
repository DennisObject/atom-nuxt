<script setup lang="ts">
const props = defineProps<{
  error?: string;
  success?: string;
  fields?: Record<string, string[]>;
}>();
const { t } = useLocale();
const dismissed = reactive({ error: false, success: false });
watch(
  () => props.error,
  () => {
    dismissed.error = false;
  }
);
watch(
  () => props.success,
  () => {
    dismissed.success = false;
  }
);
</script>
<template>
  <Teleport to="body">
    <div
      v-if="(error && !dismissed.error) || (success && !dismissed.success)"
      class="notice-stack"
      aria-live="polite"
    >
      <template v-for="kind in (['error', 'success'] as const)" :key="kind">
        <div
          v-if="props[kind] && !dismissed[kind]"
          class="notice"
          :class="kind"
          :role="kind === 'error' ? 'alert' : 'status'"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
            <ul v-if="kind === 'error' && fields && Object.keys(fields).length">
              <li v-for="(messages, field) in fields" :key="field">
                {{ messages.join(" ") }}
              </li>
            </ul>
          </div>
          <button
            class="notice-close"
            :aria-label="t('Close')"
            @click="dismissed[kind] = true"
          >
            ×
          </button>
          <div
            class="notice-progress"
            @animationend="dismissed[kind] = true"
          ></div>
        </div>
      </template>
    </div>
  </Teleport>
</template>
