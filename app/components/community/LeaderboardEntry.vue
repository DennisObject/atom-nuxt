<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{
  entry: { user: Data<"PublicUser">; value: number };
  index: number;
  label: string;
  onlineTime: boolean;
}>();
const { theme, artwork } = useAppConfig();
const { avatar, session } = useSession();
const isAtom = theme.name === "atom";
const rankColors = ["bg-[#f9d83e]", "bg-[#b8c4d4]", "bg-[#f1851b]"];
</script>

<template>
  <NuxtLink
    class="flex items-center gap-2 overflow-hidden p-3"
    :class="
      isAtom
        ? 'h-[70px] rounded bg-gray-100 dark:bg-gray-800'
        : 'h-15 rounded-md bg-[color-mix(in_srgb,var(--header)_90%,transparent)]'
    "
    :to="`/home/${entry.user.username}`"
  >
    <span
      v-if="isAtom"
      class="grid gap-4 size-10 shrink-0 place-items-center rounded-full text-gray-800"
      :class="rankColors[index] || 'bg-gray-300'"
    >
      <img
        v-if="index < 3"
        :src="artwork.medals[index]"
        :alt="String(index + 1)"
      />
      <template v-else>{{ index + 1 }}</template>
    </span>
    <img
      v-if="isAtom"
      class="[image-rendering:pixelated]"
      :class="{
        'mt-8': !session.bootstrap.assets?.avatar?.includes('www.habbo.com'),
      }"
      :src="avatar(entry.user, { size: 'b', head_direction: 2, headonly: 1 })"
      alt=""
    />
    <div
      v-else
      class="relative size-12 shrink-0 overflow-hidden rounded-full bg-[image:var(--leaderboard-portrait-background)] bg-cover bg-center"
    >
      <img
        class="absolute -top-2 left-0 max-w-none [image-rendering:pixelated]"
        :src="avatar(entry.user)"
        alt=""
      />
    </div>
    <div>
      <strong>{{ entry.user.username }}</strong>
      <p :class="{ 'text-sm': !isAtom }">
        {{
          (onlineTime
            ? Math.round(entry.value / 3600)
            : entry.value
          ).toLocaleString()
        }}
        {{ label }}
      </p>
    </div>
    <template v-if="!isAtom">
      <img
        v-if="index < 3"
        class="ml-auto size-8 object-contain [image-rendering:pixelated]"
        :src="artwork.medals[index]"
        :alt="String(index + 1)"
      />
      <span
        v-else
        class="ml-auto grid gap-4 size-8 place-items-center rounded-full bg-gray-300 text-gray-800"
      >
        {{ index + 1 }}
      </span>
    </template>
  </NuxtLink>
</template>
