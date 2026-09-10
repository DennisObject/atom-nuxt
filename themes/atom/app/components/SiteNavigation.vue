<script setup lang="ts">
const { t, session, safeUrl, mobileOpen } = useThemeShell();
const route = useRoute();
const communityLinks = computed(() => [
  { label: "Articles", path: "/community/articles" },
  { label: "Staff", path: "/community/staff" },
  { label: "Teams", path: "/community/teams" },
  { label: "Team applications", path: "/community/team-applications" },
  { label: "Staff applications", path: "/community/staff-applications" },
  ...(session.bootstrap.features?.includes("camera-photos")
    ? [{ label: "Photos", path: "/community/photos" }]
    : []),
]);
const links = computed(() => [
  { label: "Leaderboards", path: "/leaderboard", icon: "leaderboards.png" },
  ...(session.bootstrap.features?.includes("rare-values")
    ? [{ label: "Rare values", path: "/values", icon: "leaderboards.png" }]
    : []),
  { label: "Shop", path: "/shop", icon: "shop.png" },
]);
</script>

<template>
  <nav
    class="relative z-20 bg-white shadow-sm dark:bg-gray-900"
    :aria-label="t('Main navigation')"
  >
    <div
      class="min-h-[60px] max-w-7xl px-4 md:mx-auto md:flex md:items-center md:justify-between"
    >
      <div
        id="main-navigation"
        class="relative h-full w-full flex-col items-center gap-y-2 py-3 md:flex! md:flex-row md:gap-x-8 md:gap-y-0 md:py-0"
        :class="mobileOpen ? 'flex' : 'hidden'"
      >
        <NavigationDropdown
          v-if="session.user"
          name="home"
          :active="route.path.startsWith('/user')"
        >
          <img
            class="hidden h-[25px] w-5 object-none lg:inline-flex"
            src="/assets/images/atom/icons/navigation/home.png"
            alt=""
          />
          {{ session.user.username }}
          <template #children>
            <NuxtLink to="/user/me">{{ t("Home") }}</NuxtLink>
            <NuxtLink to="/draw-badge">{{ t("Badge Drawer") }}</NuxtLink>
            <NuxtLink :to="`/home/${session.user.username}`">{{
              t("My Home")
            }}</NuxtLink>
          </template>
        </NavigationDropdown>
        <NuxtLink
          v-else
          to="/"
          class="flex h-auto items-center text-sm font-semibold text-gray-700 uppercase transition duration-200 ease-in-out dark:text-gray-200 md:h-[60px] md:border-b-4 md:border-transparent md:hover:border-b-[#eeb425]"
          :class="{ 'md:!border-b-[#eeb425]': route.path === '/' }"
        >
          <img
            class="mr-1 hidden h-[25px] w-5 object-none lg:inline-flex"
            src="/assets/images/atom/icons/navigation/home.png"
            alt=""
          />{{ t("Home") }}
        </NuxtLink>
        <template v-if="session.user">
          <NavigationDropdown
            name="community"
            uppercase
            :active="route.path.startsWith('/community')"
          >
            <img
              class="hidden h-[25px] w-5 object-none lg:inline-flex"
              src="/assets/images/atom/icons/navigation/community.png"
              alt=""
            />{{ t("Community") }}
            <template #children
              ><NuxtLink
                v-for="link in communityLinks"
                :key="link.path"
                :to="link.path"
                >{{ t(link.label) }}</NuxtLink
              ></template
            >
          </NavigationDropdown>
          <NuxtLink
            v-for="link in links"
            :key="link.path"
            :to="link.path"
            class="flex h-auto items-center text-sm font-semibold text-gray-700 uppercase transition duration-200 ease-in-out dark:text-gray-200 md:h-[60px] md:border-b-4 md:border-transparent md:hover:border-b-[#eeb425]"
            :class="{
              'md:!border-b-[#eeb425]': route.path.startsWith(link.path),
            }"
          >
            <img
              class="mr-1 hidden h-[25px] w-5 object-none lg:inline-flex"
              :src="`/assets/images/atom/icons/navigation/${link.icon}`"
              alt=""
            />{{ t(link.label) }}
          </NuxtLink>
        </template>
        <NavigationDropdown
          name="assistance"
          uppercase
          :active="route.path.startsWith('/help-center')"
        >
          <img
            class="hidden h-[25px] w-5 object-none lg:inline-flex"
            src="/assets/images/atom/icons/navigation/rules.gif"
            alt=""
          />{{ t("Assistance") }}
          <template #children>
            <template v-if="session.user">
              <NuxtLink to="/help-center">{{ t("Help center") }}</NuxtLink>
              <NuxtLink
                v-if="session.user.can_manage_tickets"
                to="/help-center/tickets/all"
                >{{ t("Open tickets") }}</NuxtLink
              >
            </template>
            <NuxtLink v-else to="/help-center/rules">{{ t("Rules") }}</NuxtLink>
          </template>
        </NavigationDropdown>
        <a
          v-if="safeUrl(session.bootstrap.discord_url)"
          class="flex h-auto items-center text-sm font-semibold text-gray-700 uppercase transition duration-200 ease-in-out dark:text-gray-200 md:h-[60px] md:border-b-4 md:border-transparent md:hover:border-b-[#eeb425]"
          :href="safeUrl(session.bootstrap.discord_url)"
          target="_blank"
          rel="noopener"
          >{{ t("Discord") }}</a
        >
        <div class="flex w-full justify-center gap-x-1 md:hidden">
          <LanguageMenu mobile />
        </div>
      </div>
      <ShellTools />
      <button
        type="button"
        class="absolute top-4 right-4 z-10 rounded-none border-0 bg-transparent p-0 text-inherit hover:text-gray-900 dark:text-white dark:hover:text-white md:hidden"
        :aria-label="t('Open main menu')"
        :aria-expanded="mobileOpen"
        aria-controls="main-navigation"
        @click="mobileOpen = !mobileOpen"
      >
        <svg
          class="size-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </nav>
</template>
