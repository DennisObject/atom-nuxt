<script setup lang="ts">
import type { Data } from "~/utils/api";

const props = defineProps<{
  user: Data<"PublicUser">;
  background?: string | null;
  role?: string;
}>();

const { t } = useLocale();

const { theme } = useAppConfig();

const { safeUrl } = useApi();

const { avatar } = useSession();

const isAtom = theme.name === "atom";

const backgroundImage = computed(() => {
  const image = props.background || "/assets/images/staff-bg.png";

  return safeUrl(
    /^https?:/.test(image) || image.startsWith("/")
      ? image
      : `/assets/images/${image}`,
  );
});
</script>

<template>
  <NuxtLink
    class="relative block h-24 w-full overflow-hidden"
    :class="
      isAtom
        ? 'rounded border border-gray-200 bg-white dark:border-gray-900 dark:bg-gray-700'
        : 'rounded-lg bg-[var(--surface-deep)]'
    "
    :to="`/home/${user.username}`"
  >
    <span
      v-if="isAtom"
      class="absolute top-1 right-1 rounded bg-white px-2 text-sm font-semibold dark:bg-gray-900 dark:text-gray-300"
    >
      {{ role || t("Member") }}
    </span>

    <div
      class="h-[65%] w-full"
      :style="{ background: `rgba(0,0,0,.5) url('${backgroundImage}')` }"
    />

    <div
      class="absolute"
      :class="
        isAtom
          ? 'top-4 left-1 drop-shadow'
          : 'top-3 left-3 size-16 overflow-hidden rounded-full bg-[image:var(--portrait-background)] bg-contain bg-center'
      "
    >
      <img
        class="max-w-none transition duration-300 hover:scale-105 [image-rendering:pixelated]"
        :class="{ 'absolute -bottom-10': !isAtom }"
        :src="
          isAtom ? avatar(user, { action: 'wav' }) : avatar(user, { size: 'l' })
        "
        :alt="user.username"
      />
    </div>

    <strong
      class="block truncate text-2xl font-semibold text-white"
      :class="isAtom ? '-mt-[35px] ml-[70px]' : '-mt-[55px] ml-[90px]'"
    >
      {{ user.username }}
    </strong>

    <small
      class="block truncate font-semibold"
      :class="
        isAtom
          ? 'mt-2.5 mr-9 ml-[73px] text-sm text-gray-500'
          : 'ml-[90px] italic text-gray-200'
      "
    >
      {{ user.motto || t("No motto") }}
    </small>

    <span
      class="absolute right-4 bottom-2.5 size-[15px] rounded-full"
      :class="
        user.online
          ? isAtom
            ? 'bg-green-600'
            : 'bg-green-400'
          : isAtom
            ? 'bg-red-600'
            : 'bg-red-400'
      "
      :aria-label="t(user.online ? 'Online' : 'Offline')"
    />
  </NuxtLink>
</template>
