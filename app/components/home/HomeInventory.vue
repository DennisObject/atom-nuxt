<script setup lang="ts">
import type { Data } from "~/utils/api";

const props = defineProps<{ inventory: Data<"HomeItem">[] }>();

const emit = defineEmits<{ place: [items: Data<"HomeItem">[]] }>();

const { t } = useLocale();

const { safeUrl } = useApi();

const inventoryType = ref("s");

const inventorySelection = ref<number[]>([]);

const placeQuantity = ref(1);

const filteredInventory = computed(() =>
  props.inventory.filter(
    (item) => item.definition?.type === inventoryType.value,
  ),
);

const inventoryStacks = computed(() => {
  const stacks = new Map<
    number,
    { item: Data<"HomeItem">; items: Data<"HomeItem">[] }
  >();

  for (const item of filteredInventory.value) {
    const key = item.definition?.id ?? -item.id;

    const stack = stacks.get(key);

    if (stack) {
      stack.items.push(item);
    } else {
      stacks.set(key, { item, items: [item] });
    }
  }

  return [...stacks.values()];
});

const activeStack = computed(() =>
  inventorySelection.value.length === 1
    ? inventoryStacks.value.find(
        (stack) => stack.item.id === inventorySelection.value[0],
      )
    : undefined,
);

watch(inventorySelection, () => {
  placeQuantity.value = 1;
});

watch(inventoryType, () => {
  inventorySelection.value = [];
});

function toggleSelection(id: number) {
  inventorySelection.value = inventorySelection.value.includes(id)
    ? inventorySelection.value.filter((selected) => selected !== id)
    : [...inventorySelection.value, id];
}

function selectAll() {
  inventorySelection.value =
    inventorySelection.value.length === inventoryStacks.value.length
      ? []
      : inventoryStacks.value.map((stack) => stack.item.id);
}

function placeSelected() {
  const selected: Data<"HomeItem">[] = [];

  for (const stack of inventoryStacks.value) {
    if (!inventorySelection.value.includes(stack.item.id)) {
      continue;
    }

    const count =
      inventorySelection.value.length === 1 &&
      !["w", "b"].includes(stack.item.definition?.type || "")
        ? Math.max(
            1,
            Math.min(stack.items.length, Math.floor(placeQuantity.value)),
          )
        : 1;

    selected.push(...stack.items.slice(0, count));
  }

  emit("place", selected);

  inventorySelection.value = [];
}
</script>

<template>
  <nav
    class="flex w-44 shrink-0 flex-col gap-0.5 border-r border-[var(--border)] p-2"
    :aria-label="t('Inventory categories')"
  >
    <button
      v-for="(name, type) in {
        s: 'Stickers',
        n: 'Notes',
        w: 'Widgets',
        b: 'Backgrounds',
      }"
      :key="type"
      class="justify-start rounded border-0 px-3 py-1.5 text-left text-sm font-normal capitalize"
      :class="
        inventoryType === type
          ? 'bg-blue-500 text-white'
          : 'bg-transparent text-inherit hover:bg-gray-100 dark:hover:bg-gray-700'
      "
      @click="inventoryType = String(type)"
    >
      {{ t(name) }}
    </button>
  </nav>

  <div
    class="flex min-w-[140px] flex-1 flex-wrap content-start gap-1.5 px-3 pt-2 pb-3"
  >
    <div
      v-if="inventoryStacks.length"
      class="flex w-full items-center justify-between gap-2 pb-1"
    >
      <button
        class="border-0 bg-transparent p-0 text-[11px] font-normal text-gray-400 hover:text-gray-800 dark:hover:text-white"
        @click="selectAll"
      >
        {{
          t(
            inventorySelection.length === inventoryStacks.length
              ? "Deselect all"
              : "Select all",
          )
        }}
      </button>

      <span
        v-if="inventorySelection.length > 1"
        class="text-[11px] text-gray-400"
      >
        {{ inventorySelection.length }} {{ t("selected") }}
      </span>
    </div>

    <button
      v-for="stack in inventoryStacks"
      :key="stack.item.id"
      class="relative size-16 rounded border border-[var(--border)] bg-transparent p-0 aria-pressed:border-[#eeb425] aria-pressed:bg-yellow-50 dark:aria-pressed:bg-[#eeb425]/10"
      :title="stack.item.definition?.name"
      :aria-pressed="inventorySelection.includes(stack.item.id)"
      @click="toggleSelection(stack.item.id)"
      @dblclick="
        emit('place', [stack.item]);
        inventorySelection = [];
      "
    >
      <img
        class="max-h-14 max-w-14 object-contain"
        v-if="stack.item.definition?.image"
        :src="safeUrl(stack.item.definition.image)"
        :alt="stack.item.definition.name"
      />

      <span v-else>{{ stack.item.definition?.name }}</span>

      <span
        v-if="stack.items.length > 1"
        class="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-blue-600 px-0.5 text-[9px] text-white"
      >
        {{ stack.items.length }}
      </span>

      <span
        v-if="inventorySelection.includes(stack.item.id)"
        class="absolute top-0 left-0 size-4 rounded-br bg-[#eeb425] text-[10px] text-white"
      >
        ✓
      </span>
    </button>

    <p
      v-if="!inventoryStacks.length"
      class="w-full py-10 text-center text-sm text-gray-400"
    >
      {{ t("No items here.") }}
    </p>
  </div>

  <aside
    class="flex w-44 shrink-0 flex-col items-center gap-2 border-l border-[var(--border)] p-3 text-center text-sm"
  >
    <template v-if="activeStack">
      <strong>{{ activeStack.item.definition?.name }}</strong>

      <img
        class="max-h-[72px] max-w-[72px] object-contain"
        v-if="activeStack.item.definition?.image"
        :src="safeUrl(activeStack.item.definition.image)"
        alt=""
      />

      <p class="text-xs text-gray-400">
        {{ activeStack.items.length }} {{ t("available") }}
      </p>

      <label
        class="text-xs"
        v-if="
          activeStack.items.length > 1 &&
          activeStack.item.definition?.type === 's'
        "
      >
        {{ t("Quantity") }}
        <input
          class="w-16 rounded border border-[var(--border)] px-2 py-1 text-center text-sm"
          v-model.number="placeQuantity"
          type="number"
          min="1"
          :max="activeStack.items.length"
        />
      </label>

      <button
        class="mt-auto w-full rounded border-2 border-green-500 bg-green-600 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
        :disabled="!Number.isInteger(placeQuantity) || placeQuantity < 1"
        @click="placeSelected"
      >
        {{ t("Place") }}
      </button>
    </template>

    <template v-else-if="inventorySelection.length">
      <strong>{{ inventorySelection.length }} {{ t("items selected") }}</strong>

      <button
        class="w-full rounded border-2 border-green-500 bg-green-600 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
        @click="placeSelected"
      >
        {{ t("Place All") }}
      </button>
    </template>

    <p v-else class="mt-8 text-xs text-gray-400">
      {{ t("Click items to select, double-click to quick-place.") }}
    </p>
  </aside>
</template>
