<script setup lang="ts">
const { hotel, error, openMenu, mobileOpen } = provideThemeShell();
</script>

<template>
  <div
    class="relative min-h-[calc(100vh-3.5rem)] overflow-clip"
    @click.self="openMenu = ''"
    @keydown.esc="
      openMenu = '';
      mobileOpen = false;
    "
  >
    <SiteNavigation />

    <ShellTools />

    <div
      class="absolute h-[400px] w-full bg-[#957cc3] bg-[url(/assets/images/dusk/background_image.png)] bg-cover bg-top-left bg-no-repeat [mask-image:linear-gradient(to_top,transparent,black)] before:absolute before:inset-0 before:bg-[rgba(46,45,45,0.7)]"
      aria-hidden="true"
    ></div>

    <main
      class="relative mx-auto w-full min-w-0 max-w-[1280px] p-4 lg:py-20 xl:px-0"
      @click="openMenu = ''"
    >
      <AppNotice :error="error" />

      <slot />
    </main>
  </div>

  <SiteCredits :hotel="hotel" />
</template>
