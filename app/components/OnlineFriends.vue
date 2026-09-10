<script setup lang="ts">
import OnlineFriend from "~/components/OnlineFriend.vue";

const { t } = useLocale();

const { theme } = useAppConfig();

const { session } = useSession();
</script>

<template>
  <div
    v-if="session.user"
    class="flex flex-col gap-3 rounded p-1 lg:flex-row lg:items-center lg:justify-between"
    :class="
      theme.name === 'atom'
        ? 'bg-white shadow-sm dark:bg-gray-800'
        : 'bg-[#2b303c] shadow-md'
    "
  >
    <div
      class="relative flex items-center justify-center rounded bg-[#e9b124] px-2 py-2 text-sm font-semibold"
      :class="{
        'dark:border-gray-700 dark:text-gray-300 lg:self-stretch':
          theme.name === 'atom',
      }"
    >
      <div
        class="invisible -right-1 size-6 rotate-45 bg-[#e9b124] lg:visible lg:absolute"
      ></div>

      <img
        class="mr-2 mb-1 inline-flex max-h-6 max-w-6"
        src="/assets/images/icons/online-friends.png"
        alt=""
      />

      <span class="relative text-white">{{ t("Online Friends") }}</span>
    </div>

    <div
      class="relative flex flex-wrap items-center justify-center gap-2 pl-2 sm:justify-start"
    >
      <OnlineFriend
        v-for="friend in session.user.online_friends"
        :key="friend.id"
        :friend="friend"
      />
    </div>
  </div>
</template>
