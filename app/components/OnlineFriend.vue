<script setup lang="ts">
import type { Data } from "~/utils/api";
const props = defineProps<{ friend: Data<"OnlineFriend"> }>();
const { t } = useLocale();
const { theme } = useAppConfig();
const { avatar } = useSession();
const tooltip = ref<{ top: number; left: number } | null>(null);
const onlineSince = computed(() => {
  const timestamp = props.friend.last_online;

  return typeof timestamp === "number"
    ? new Date(timestamp * 1000).toISOString().slice(0, 19).replace("T", " ")
    : "";
});

function show(event: Event): void {
  const target = event.currentTarget as HTMLElement;
  const bounds = target.getBoundingClientRect();
  tooltip.value = {
    top: bounds.top - 8,
    left: Math.max(
      8,
      Math.min(window.innerWidth - 264, bounds.left + bounds.width / 2 - 128),
    ),
  };
}

function hide(): void {
  tooltip.value = null;
}
</script>

<template>
  <NuxtLink
    :to="`/home/${friend.username}`"
    class="inline-block size-10 rounded-full border-2 border-gray-300 bg-center bg-no-repeat [image-rendering:pixelated]"
    :class="{ 'dark:border-gray-900': theme.name === 'atom' }"
    :style="{
      backgroundImage: `url('${avatar(friend, { action: 'wav', headonly: 1, size: 's' })}')`,
    }"
    :aria-label="friend.username"
    :aria-describedby="tooltip ? `friend-${friend.id}` : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @keydown.esc="hide"
  />
  <Teleport to="body">
    <div
      v-if="tooltip"
      :id="`friend-${friend.id}`"
      role="tooltip"
      class="pointer-events-none fixed z-50 inline-block w-64 -translate-y-full rounded-lg border border-gray-200 bg-white text-sm font-light text-gray-500 shadow-xs"
      :class="{
        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400':
          theme.name === 'atom',
      }"
      :style="{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }"
    >
      <div
        class="rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2"
        :class="{
          'dark:border-gray-600 dark:bg-gray-700': theme.name === 'atom',
        }"
      >
        <div
          class="flex w-full items-center justify-center font-semibold text-gray-900"
          :class="{ 'dark:text-white': theme.name === 'atom' }"
        >
          {{ friend.username }}
        </div>
      </div>
      <div class="max-h-[200px] overflow-y-auto px-3 py-2">
        <b class="mr-1 font-bold">{{ t("Motto") }}:</b>
        {{ friend.motto }}
        <template v-if="onlineSince">
          <br />
          <b class="mr-1 font-bold">{{ t("Online Since") }}:</b>
          {{ onlineSince }}
        </template>
      </div>
      <div
        class="absolute -bottom-1 left-1/2 size-2 rotate-45 border-r border-b border-gray-200 bg-white"
        :class="{
          'dark:border-gray-600 dark:bg-gray-800': theme.name === 'atom',
        }"
      ></div>
    </div>
  </Teleport>
</template>
