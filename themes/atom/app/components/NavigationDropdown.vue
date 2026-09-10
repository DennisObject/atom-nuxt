<script setup lang="ts">
defineProps<{
  name: string;
  active?: boolean;
  uppercase?: boolean;
  panelClass?: string;
  borderless?: boolean;
}>();

const { openMenu, closeMenu } = useThemeShell();
</script>

<template>
  <div
    class="nav-menu relative z-5 text-sm font-semibold text-black transition duration-200 ease-in-out dark:text-gray-200 md:h-[60px]"
    :class="{
      'md:border-b-4 md:border-transparent md:hover:border-b-[#eeb425]':
        !borderless,
      'md:!border-b-[#eeb425]': active,
    }"
    @focusout="closeMenu"
    @keydown.esc.stop.prevent="openMenu = ''"
  >
    <button
      type="button"
      class="flex h-full items-center rounded-none border-0 bg-transparent p-0 text-inherit hover:text-inherit hover:brightness-100 md:gap-2"
      :class="{ uppercase }"
      :aria-expanded="openMenu === name"
      :aria-controls="`atom-menu-${name}`"
      @click="openMenu = openMenu === name ? '' : name"
    >
      <slot />

      <svg
        class="size-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div
      v-show="openMenu === name"
      :id="`atom-menu-${name}`"
      class="absolute left-0 z-30 mt-2 min-w-[150px] overflow-hidden rounded bg-white whitespace-nowrap shadow-sm dark:bg-gray-800 [&>a]:block [&>a]:px-4 [&>a]:py-2 [&>a]:font-semibold [&>a]:text-gray-900 [&>a:hover]:bg-gray-100 dark:[&>a]:text-gray-200 dark:[&>a:hover]:bg-gray-700"
      :class="panelClass"
    >
      <slot name="children" />
    </div>
  </div>
</template>
