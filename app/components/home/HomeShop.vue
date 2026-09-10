<script setup lang="ts">
import type { Data } from "~/utils/api";
import HomeShopSelection from "./HomeShopSelection.vue";

const props = defineProps<{ shop: Data<"HomeShop">; busy: boolean }>();

const emit = defineEmits<{
  preview: [items: Data<"HomeDefinition">[]];
  buy: [item: Data<"HomeDefinition">, quantity: number, place: boolean];
  buySelected: [items: Data<"HomeDefinition">[], place: boolean];
}>();

const { t } = useLocale();

const { safeUrl } = useApi();

const shopTab = ref("home");

const selection = ref<number[]>([]);

const categories = computed(
  () =>
    props.shop.categories as (Data<"HomeShop">["categories"][number] & {
      icon?: string | null;
    })[],
);

const filteredItems = computed(() => {
  if (shopTab.value.startsWith("category:")) {
    const category = Number(shopTab.value.slice(9));

    return props.shop.items.filter(
      (item) => item.type === "s" && item.category_id === category,
    );
  }

  return props.shop.items.filter((item) => item.type === shopTab.value);
});

const selectedItems = computed(() =>
  filteredItems.value.filter((item) => selection.value.includes(item.id)),
);

watch(shopTab, () => {
  selection.value = [];
});

function toggleSelection(id: number) {
  selection.value = selection.value.includes(id)
    ? selection.value.filter((selected) => selected !== id)
    : [...selection.value, id];
}

function selectAll() {
  selection.value =
    selection.value.length === filteredItems.value.length
      ? []
      : filteredItems.value.map((item) => item.id);
}
</script>

<template>
  <nav
    class="flex w-44 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-[var(--border)] p-2"
    :aria-label="t('Shop categories')"
  >
    <button
      v-for="(label, type) in { n: 'Notes', w: 'Widgets', b: 'Backgrounds' }"
      :key="type"
      class="justify-start rounded border-0 px-3 py-1.5 text-left text-sm font-normal"
      :class="
        shopTab === type
          ? 'bg-[#eeb425] text-white'
          : 'bg-transparent text-inherit hover:bg-gray-100 dark:hover:bg-gray-700'
      "
      @click="shopTab = type"
    >
      {{ t(label) }}
    </button>

    <div class="mt-1 border-t border-[var(--border)] pt-1">
      <p class="mb-1 px-3 text-[10px] uppercase tracking-wider text-gray-400">
        {{ t("Stickers") }}
      </p>

      <button
        v-for="category in categories"
        :key="category.id"
        class="w-full justify-start truncate rounded border-0 px-3 py-1 text-left text-sm font-normal"
        :class="
          shopTab === `category:${category.id}`
            ? 'bg-[#eeb425] text-white'
            : 'bg-transparent text-inherit hover:bg-gray-100 dark:hover:bg-gray-700'
        "
        @click="shopTab = `category:${category.id}`"
      >
        <img
          v-if="category.icon"
          :src="safeUrl(category.icon)"
          alt=""
          class="size-4 shrink-0 object-contain"
        />

        <span class="truncate">{{ category.name }}</span>
      </button>
    </div>
  </nav>

  <div class="flex min-w-[140px] flex-1 flex-col">
    <div
      v-if="filteredItems.length"
      class="flex shrink-0 items-center justify-between px-3 pt-2 pb-1"
    >
      <button
        class="border-0 bg-transparent p-0 text-[11px] font-normal text-gray-400 hover:text-gray-800 dark:hover:text-white"
        @click="selectAll"
      >
        {{
          t(
            selection.length === filteredItems.length
              ? "Deselect all"
              : "Select all",
          )
        }}
      </button>

      <span v-if="selection.length > 1" class="text-[11px] text-gray-400">
        {{ selection.length }} {{ t("selected") }}
      </span>
    </div>

    <div class="flex-1 overflow-y-auto px-3 pb-3">
      <p
        v-if="shopTab === 'home'"
        class="py-10 text-center text-sm text-gray-400"
      >
        {{ t("Pick a category to browse items.") }}
      </p>

      <div v-else class="flex flex-wrap gap-1.5">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          class="relative flex size-16 items-center justify-center rounded border border-[var(--border)] bg-transparent p-0 transition aria-pressed:border-[#eeb425] aria-pressed:bg-yellow-50 dark:aria-pressed:bg-[#eeb425]/10"
          :aria-label="t('Select :name', { name: item.name })"
          :aria-pressed="selection.includes(item.id)"
          @click="toggleSelection(item.id)"
        >
          <img
            v-if="item.image"
            :src="safeUrl(item.image)"
            alt=""
            class="max-h-14 max-w-14 object-contain"
            :class="{ '[image-rendering:pixelated]': item.type === 'b' }"
          />

          <span v-else class="text-xs">{{ item.name }}</span>

          <span
            class="absolute right-0 bottom-0 rounded-tl bg-black/60 px-1 text-[9px] leading-tight text-white"
          >
            {{ item.price }}
          </span>

          <span
            v-if="selection.includes(item.id)"
            class="absolute top-0 left-0 flex size-4 items-center justify-center rounded-br bg-[#eeb425] text-[10px] text-white"
            >✓</span
          >
        </button>

        <p
          v-if="!filteredItems.length"
          class="w-full py-10 text-center text-sm text-gray-400"
        >
          {{ t("No items.") }}
        </p>
      </div>
    </div>
  </div>

  <HomeShopSelection
    :items="selectedItems"
    :busy="busy"
    @preview="emit('preview', $event)"
    @buy="(item, quantity, place) => emit('buy', item, quantity, place)"
    @buy-selected="(items, place) => emit('buySelected', items, place)"
  />
</template>
