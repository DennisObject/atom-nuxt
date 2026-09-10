<script setup lang="ts">
const props = defineProps<{ name: string }>();

const icons: Record<string, { color: string; src: string }> = {
  "hotel-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/feeds.png",
  },
  "chat-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/chat.png",
  },
  "article-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/article.gif",
  },
  "lighthouse-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/lighthouse.png",
  },
  "catalog-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/catalog.png",
  },
  "inventory-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/inventory.png",
  },
  "duo-chat-icon": {
    color: "bg-transparent",
    src: "/assets/images/icons/due-chat.png",
  },
  "friends-icon": {
    color: "bg-[#b17f85]",
    src: "/assets/images/icons/friends.png",
  },
  "camera-icon": {
    color: "bg-transparent",
    src: "/assets/images/atom/icons/camera.png",
  },
  "discord-icon": {
    color: "bg-transparent",
    src: "/assets/images/atom/icons/discord.png",
  },
  "currency-icon": {
    color: "bg-transparent",
    src: "/assets/images/dusk/store_icon.png",
  },
};

const icon = computed(
  () =>
    icons[props.name] || {
      color: "bg-transparent",
      src: `/assets/images/dusk/${props.name}.png`,
    },
);
</script>

<template>
  <span
    class="flex size-[var(--icon-size,50px)] shrink-0 items-center justify-center rounded-full"
    :class="icon.color"
    aria-hidden="true"
  >
    <img
      :src="icon.src"
      class="max-h-[50px] max-w-[50px] [image-rendering:pixelated]"
      alt=""
    />
  </span>
</template>
