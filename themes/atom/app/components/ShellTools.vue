<script setup lang="ts">
const { t } = useLocale();
const { isDark, toggleMode } = useThemeMode();
</script>

<template>
  <div class="hidden items-center lg:flex">
    <button
      type="button"
      class="mr-3 flex items-center justify-center rounded-lg border-0 bg-gray-200 p-1 shadow-inner dark:bg-gray-800"
      :aria-label="t('Toggle dark mode')"
      :aria-pressed="isDark"
      @click="toggleMode"
    >
      <svg
        class="size-5 text-gray-600 dark:text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646a9 9 0 1011.708 11.708z"
        />
      </svg>
    </button>
    <LanguageMenu />
  </div>
</template>
