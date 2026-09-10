<script setup lang="ts">
import type { Data } from "~/utils/api";
import HomeWidget from "~/components/HomeWidget.vue";

defineProps<{
  items: Data<"HomeItem">[];
  background: string;
  username: string;
  memberSince?: string;
  visitor: boolean;
  owner: boolean;
  editing: boolean;
  selectedId?: number;
}>();
const emit = defineEmits<{
  drag: [event: PointerEvent, item: Data<"HomeItem">];
  select: [item: Data<"HomeItem">];
  remove: [item: Data<"HomeItem">];
}>();
const { t } = useLocale();
const { safeUrl } = useApi();
</script>

<template>
  <div
    class="relative h-[1360px] min-h-[1360px] w-full max-w-[928px] overflow-hidden rounded-lg border border-[var(--border)] bg-cover bg-center bg-no-repeat shadow-sm"
    :style="{
      backgroundImage: background ? `url('${safeUrl(background)}')` : undefined,
    }"
  >
    <template v-for="item in items" :key="item.id">
      <section
        v-if="item.placed && item.definition?.type !== 'b'"
        :class="[
          'absolute overflow-hidden',
          item.definition?.type === 's'
            ? 'w-auto rounded-lg border-0 bg-transparent p-0'
            : item.definition?.type === 'n'
              ? 'min-h-20 min-w-[150px] rounded border border-amber-200 bg-amber-50 p-3 text-xs text-gray-800'
              : 'w-[280px] min-w-[270px] max-w-[300px] rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0 text-[var(--text)]',
          {
            'touch-none select-none cursor-grab active:cursor-grabbing':
              editing,
            'opacity-60 outline-2 outline-dashed outline-cyan-400': item.id < 0,
          },
        ]"
        :style="{
          left: `${item.x}px`,
          top: `${item.y}px`,
          zIndex: item.z,
        }"
        @pointerdown="emit('drag', $event, item)"
        @click="editing && emit('select', item)"
      >
        <h3
          class="bg-[var(--header)] px-3 py-2 text-sm font-semibold"
          v-if="item.definition?.type === 'w'"
        >
          {{ item.definition?.name }}
        </h3>
        <HomeWidget
          v-if="item.definition?.type === 'w' && item.id > 0"
          :class="{ 'pointer-events-none': editing }"
          :member-since="memberSince"
          :username="username"
          :item="item"
          :visitor="visitor"
          :editing="editing"
        />
        <p v-else-if="item.definition?.type === 'w'" class="p-2 italic">
          {{ t("Preview") }}
        </p>
        <p
          v-else-if="item.definition?.type === 'n'"
          class="whitespace-pre-wrap"
        >
          {{ item.extra_data }}
        </p>
        <img
          v-else-if="item.definition?.image"
          :src="safeUrl(item.definition.image)"
          :alt="item.definition.name"
          class="pointer-events-none"
          :class="{ '-scale-x-100': item.is_reversed }"
        />
        <button
          v-if="editing && selectedId === item.id && item.id > 0"
          class="absolute top-0 right-0 z-50 flex size-7 items-center justify-center rounded-none rounded-bl-lg border-0 bg-red-500/90 p-0 text-xs text-white hover:bg-red-400"
          :aria-label="t('Return to inventory')"
          @click.stop="emit('remove', item)"
        >
          ×
        </button>
      </section>
    </template>
    <p
      v-if="!items.filter((item) => item.placed).length"
      class="rounded-lg bg-[var(--empty-bg)] p-[25px] text-center text-[var(--empty-text)]"
    >
      {{
        t(
          owner
            ? "Make this space your own. Edit your home to place items."
            : "This home has not been decorated yet.",
        )
      }}
    </p>
  </div>
</template>
