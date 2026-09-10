<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{ label: string; description?: string; compact?: boolean }>();
const { theme } = useAppConfig();
const model = defineModel<string>({ required: true });
</script>

<template>
  <label
    class="flex flex-col text-base font-semibold text-gray-700 dark:text-gray-200"
    :class="[
      compact ? 'gap-0' : 'gap-1',
      { 'text-gray-200!': theme.name === 'dusk' },
    ]"
  >
    <span class="mb-2">
      {{ label }}
      <span
        v-if="description"
        class="block text-sm leading-[21px] font-normal text-gray-500 dark:text-gray-400"
        :class="{ 'text-gray-400!': theme.name === 'dusk' }"
        >{{ description }}</span
      >
    </span>
    <input
      v-model="model"
      v-bind="$attrs"
      class="min-h-0 w-full rounded px-3 py-2 text-base focus:border-[#eeb425] focus:ring-0 focus:outline-none"
      :class="
        theme.name === 'atom'
          ? 'border-4 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
          : 'border-2 border-gray-700 bg-[#21242e] text-gray-200'
      "
    />
  </label>
</template>
