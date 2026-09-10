<script setup lang="ts">
const { hotel, error, openMenu, mobileOpen } = provideThemeShell();
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div
      class="bg-gray-100 dark:bg-gray-900"
      @click.self="openMenu = ''"
      @keydown.esc="
        openMenu = '';
        mobileOpen = false;
      "
    >
      <AccountBar />
      <SiteBanner />
      <SiteNavigation />
      <main
        class="overflow-hidden bg-[image:var(--body-artwork)] bg-fixed bg-position-[right_bottom] bg-no-repeat"
        @click="openMenu = ''"
      >
        <div
          class="relative mx-auto mt-10 w-full min-w-0 max-w-7xl p-6 md:mt-0"
        >
          <AppNotice :error="error" />
          <slot />
        </div>
      </main>
    </div>
    <div class="mt-auto"><SiteCredits :hotel="hotel" /></div>
  </div>
</template>
