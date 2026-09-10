<script setup lang="ts">
const { t, locale, busy, languages, changeLocale } = useThemeShell();
defineProps<{ mobile?: boolean }>();
</script>

<template>
  <NavigationDropdown
    :name="mobile ? 'mobile-language' : 'language'"
    borderless
    panel-class="!min-w-[50px] -ml-4"
    :aria-label="t('Language')"
  >
    <img :src="`/assets/images/icons/flags/${locale}.png`" :alt="locale" />
    <template #children>
      <button
        v-for="language in languages"
        :key="language.locale"
        class="block w-full rounded-none border-0 bg-transparent px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        :aria-label="language.name"
        :title="language.name"
        :disabled="busy"
        @click="changeLocale(language.locale)"
      >
        <img
          :src="`/assets/images/icons/flags/${language.locale}.png`"
          :alt="language.name"
        />
      </button>
    </template>
  </NavigationDropdown>
</template>
