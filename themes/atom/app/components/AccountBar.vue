<script setup lang="ts">
const { t, session, safeUrl, avatar, busy, logout } = useThemeShell();

const currencies = computed(() => [
  {
    name: "Credits",
    icon: "bg-[#e9b124] bg-[url(/assets/images/icons/currency/credits.png)] outline-[#b26d18]",
    amount: session.user?.balances?.credits ?? 0,
  },
  {
    name: "Duckets",
    icon: "bg-[#c44aac] bg-[url(/assets/images/icons/currency/duckets.png)] outline-[#812378]",
    amount: session.user?.balances?.duckets ?? 0,
  },
  {
    name: "Diamonds",
    icon: "bg-[#caf1f3] bg-[url(/assets/images/icons/currency/diamonds.png)] outline-[#6caff4]",
    amount: session.user?.balances?.diamonds ?? 0,
  },
]);

const head = computed(() =>
  avatar(session.user, { headonly: 1, head_direction: 2 }),
);
</script>

<template>
  <div v-if="session.user" class="bg-gray-100 dark:bg-gray-900">
    <div
      class="min-h-[60px] max-w-7xl px-4 md:mx-auto md:flex md:items-center md:justify-between"
    >
      <div class="flex gap-x-6">
        <div
          v-for="currency in currencies"
          :key="currency.name"
          class="hidden gap-x-3 md:flex"
        >
          <span
            class="size-[25px] rounded-full bg-center bg-no-repeat outline outline-offset-[3px]"
            :class="currency.icon"
            aria-hidden="true"
          ></span>

          <div class="dark:text-gray-400">
            <span class="font-semibold dark:text-white">
              {{ currency.amount }}
            </span>
            {{ t(currency.name) }}
          </div>
        </div>
      </div>

      <div class="flex gap-x-3">
        <NavigationDropdown
          v-if="
            session.bootstrap.viewer?.can_generate_logo ||
            session.bootstrap.viewer?.can_show_housekeeping_link
          "
          name="administration"
          class="!text-red-700"
          borderless
        >
          {{ t("Administration") }}
          <template #children>
            <NuxtLink
              v-if="session.bootstrap.viewer?.can_generate_logo"
              to="/logo-generator"
              target="_blank"
            >
              {{ t("Logo generator") }}
            </NuxtLink>

            <a
              v-if="
                session.bootstrap.viewer?.can_show_housekeeping_link &&
                safeUrl(session.bootstrap.housekeeping_url)
              "
              :href="safeUrl(session.bootstrap.housekeeping_url)"
              target="_blank"
              rel="noopener"
            >
              {{ t("Housekeeping") }}
            </a>
          </template>
        </NavigationDropdown>

        <NavigationDropdown name="account" borderless>
          <div
            class="bg-center bg-no-repeat"
            :class="
              session.bootstrap.assets?.avatar?.includes('www.habbo.com')
                ? 'h-[62px] w-[54px]'
                : 'h-[110px] w-16'
            "
            :style="{ backgroundImage: `url('${head}')` }"
          ></div>

          <span class="-ml-2">{{ session.user.username }}</span>

          <template #children>
            <NuxtLink to="/user/settings/account">
              {{ t("User settings") }}
            </NuxtLink>

            <button
              class="w-full justify-start rounded-none border-0 bg-transparent px-4 py-2 text-left text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              :disabled="busy"
              @click="logout"
            >
              {{ t("Logout") }}
            </button>
          </template>
        </NavigationDropdown>
      </div>
    </div>
  </div>
</template>
