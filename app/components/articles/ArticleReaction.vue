<script setup lang="ts">
defineProps<{
  name: string;
  count: number;
  users: string[];
  selected: boolean;
  busy: boolean;
  authenticated: boolean;
}>();

const emit = defineEmits<{ select: [] }>();

const { t } = useLocale();

const { theme } = useAppConfig();

const hovered = ref(false);

const focused = ref(false);

const position = ref({ top: 0, left: 0 });

const tooltipId = useId();

function positionPopover(event: Event): void {
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();

  position.value = {
    top: bounds.top - 8,
    left: Math.max(
      8,
      Math.min(window.innerWidth - 264, bounds.left + bounds.width / 2 - 128),
    ),
  };
}

function leaveFocus(event: FocusEvent): void {
  focused.value = (event.currentTarget as HTMLElement).contains(
    event.relatedTarget as Node | null,
  );
}
</script>

<template>
  <div
    class="relative"
    @mouseenter="
      hovered = true;
      positionPopover($event);
    "
    @mouseleave="hovered = false"
    @focusin="
      focused = true;
      positionPopover($event);
    "
    @focusout="leaveFocus"
    @keydown.esc.stop="
      hovered = false;
      focused = false;
    "
  >
    <button
      type="button"
      class="flex h-8 w-12 items-center justify-center gap-2 rounded-lg border-2 bg-transparent p-0 text-sm font-bold hover:bg-gray-700 hover:filter-none"
      :class="[
        theme.name === 'dusk'
          ? 'border-gray-800 text-gray-100'
          : 'border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100',
        {
          'bg-gray-800! border-gray-700! text-gray-100!': selected,
          'transition-all hover:scale-110': authenticated,
          'cursor-default': !authenticated,
        },
      ]"
      :aria-pressed="selected"
      :aria-disabled="busy || !authenticated"
      :aria-describedby="
        users.length && (hovered || focused) ? tooltipId : undefined
      "
      @click="!busy && authenticated && emit('select')"
    >
      <img :src="`/assets/images/icons/reactions/${name}.png`" :alt="name" />

      <span>{{ count }}</span>
    </button>

    <span
      v-if="users.length && (hovered || focused)"
      class="absolute -top-2 left-0 h-2 w-full"
      aria-hidden="true"
    ></span>

    <div
      v-if="users.length && (hovered || focused)"
      :id="tooltipId"
      role="tooltip"
      class="fixed z-50 inline-block w-64 -translate-y-full rounded-lg border border-gray-600 bg-gray-800 text-sm font-light text-gray-100 shadow-xs"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
    >
      <div class="rounded-t-lg border-b border-gray-600 bg-gray-700 px-3 py-2">
        <div
          class="flex w-full items-center justify-center font-semibold text-white"
        >
          {{ t("Reactions with")
          }}<img
            class="ml-1"
            :src="`/assets/images/icons/reactions/${name}.png`"
            :alt="name"
          />
        </div>
      </div>

      <div class="max-h-[200px] overflow-y-auto px-3 py-2">
        <p
          v-for="username in users"
          :key="username"
          class="w-full text-center"
        >
          {{ username }}
        </p>
      </div>

      <div
        class="absolute -bottom-1 left-1/2 size-2 rotate-45 border-r border-b border-gray-600 bg-gray-800"
      ></div>
    </div>
  </div>
</template>
