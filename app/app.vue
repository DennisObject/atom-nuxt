<script setup lang="ts">
const route = useRoute();

const { session } = useSession();

const { locale } = useLocale();

const { isDark } = useThemeMode();

const { theme } = useAppConfig();

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    class: isDark.value ? "dark" : "",
    "data-theme": theme.name,
  },
}));

watch(
  () => [session.user, session.restriction],
  () => {
    if (!session.ready) {
      return;
    }

    const destination = accessDestination(
      route.path,
      !!route.meta.auth,
      session,
    );

    if (destination) {
      void navigateTo(
        destination === "/login"
          ? { path: destination, query: { next: route.fullPath } }
          : destination,
      );
    }
  },
);

watch(
  () => route.fullPath,
  () => {
    if (import.meta.client) {
      document
        .querySelectorAll("details.nav-menu[open]")
        .forEach((menu) => menu.removeAttribute("open"));
    }
  },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage :page-key="(route) => route.fullPath" />
  </NuxtLayout>
</template>
