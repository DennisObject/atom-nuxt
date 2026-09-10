<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{ label: string; description?: string; avatar?: string }>();
const model = defineModel<string>({ required: true });
const { theme } = useAppConfig();
const atom = theme.name === "atom";
</script>

<template>
  <label
    class="relative block text-base font-normal"
    :class="{ 'overflow-hidden': avatar, '-mt-3 pt-3': avatar && !atom }"
  >
    <span
      :class="
        atom
          ? 'mb-2 block font-semibold text-gray-700 dark:text-gray-200'
          : 'sr-only'
      "
    >
      {{ label }}
      <span
        v-if="description"
        class="block text-[14px] leading-normal font-normal text-gray-500 dark:text-gray-400"
      >
        {{ description }}
      </span>
    </span>
    <input
      v-model="model"
      v-bind="$attrs"
      class="min-h-0 w-full px-3 py-2 text-base font-normal"
      :class="
        atom
          ? 'rounded border-4 border-gray-200 bg-white text-gray-700 focus:border-[#eeb425] focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
          : 'relative rounded-md border border-gray-500 bg-white text-black focus:border-blue-600 focus:ring-blue-600'
      "
    />
    <img
      v-if="avatar && !atom"
      :src="avatar"
      alt=""
      class="absolute right-0 -top-4"
    />
  </label>
</template>
