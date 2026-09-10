<script setup lang="ts">
const { t, locale, busy, openMenu, languages, closeMenu, changeLocale } =
  useThemeShell();
</script>

<template>
  <div
    class="language-menu relative"
    @focusout="closeMenu"
    @keydown.esc="openMenu = ''"
  >
    <button
      class="flex items-center justify-center gap-1 border-0 bg-transparent p-0 text-gray-400"
      :disabled="busy"
      :aria-label="t('Language')"
      :aria-expanded="openMenu === 'language'"
      aria-controls="language-options"
      @click="openMenu = openMenu === 'language' ? '' : 'language'"
    >
      <img
        class="h-auto"
        :src="`/assets/images/icons/flags/${locale}.png`"
        :alt="locale"
      />
      <svg
        class="size-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <div
      v-show="openMenu === 'language'"
      id="language-options"
      class="absolute top-full z-30 rounded -left-2 mt-1 flex w-[50px] flex-col gap-2 bg-[#ac93da] py-2 shadow-sm"
    >
      <button
        v-for="language in languages"
        :key="language.locale"
        class="flex w-full justify-center rounded-none border-0 bg-transparent px-2 py-1 transition-transform duration-300 hover:scale-110 hover:bg-[#8770b2]"
        :aria-label="language.name"
        :title="language.name"
        :disabled="busy"
        @click="changeLocale(language.locale)"
      >
        <img
          class="h-auto"
          :src="`/assets/images/icons/flags/${language.locale}.png`"
          :alt="language.name"
        />
      </button>
    </div>
  </div>
</template>
