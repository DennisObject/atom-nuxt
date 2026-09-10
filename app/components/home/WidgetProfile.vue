<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{
  content: Extract<Data<"HomeWidget">, { type: "my-profile" }>["content"];
  memberSince?: string;
}>();
const { t } = useLocale();
const { avatar } = useSession();
</script>

<template>
  <div
    class="flex items-start justify-between gap-3 border-b border-[var(--border)] px-2 pt-2 pb-3"
  >
    <div>
      <NuxtLink
        class="text-blue-500 hover:underline"
        :to="`/home/${content.username}`"
      >
        <strong>{{ content.username }}</strong>
      </NuxtLink>
      <small
        class="block text-xs"
        :class="
          content.online
            ? 'font-semibold text-green-500'
            : 'text-[var(--text-subtle)]'
        "
      >
        {{ t(content.online ? "Online" : "Offline") }}
      </small>
      <small class="mt-1 block text-xs text-gray-500" v-if="memberSince">
        {{ t("Member since") }} {{ memberSince.slice(0, 10) }}
      </small>
    </div>
    <img
      class="h-auto w-16 [image-rendering:pixelated]"
      :src="avatar(content, { direction: 4, head_direction: 4 })"
      :alt="content.username"
    />
  </div>
  <p class="p-2 text-xs italic">{{ content.motto }}</p>
</template>
