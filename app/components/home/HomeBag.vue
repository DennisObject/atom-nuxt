<script setup lang="ts">
import type { Data } from "~/utils/api";
import HomeInventory from "./HomeInventory.vue";
import HomeShop from "./HomeShop.vue";

const props = defineProps<{
  inventory: Data<"HomeItem">[];
  shop: Data<"HomeShop">;
  busy: boolean;
  error: string;
  fields: Record<string, string[]>;
  success: string;
}>();

const emit = defineEmits<{
  place: [items: Data<"HomeItem">[]];
  preview: [items: Data<"HomeDefinition">[]];
  buy: [item: Data<"HomeDefinition">, quantity: number, place: boolean];
  buySelected: [items: Data<"HomeDefinition">[], place: boolean];
}>();

const { t } = useLocale();

const bag = ref<HTMLDialogElement>();

const bagTab = ref("inventory");

function open(tab: string) {
  bagTab.value = tab;

  bag.value?.showModal();
}

function close() {
  bag.value?.close();
}

defineExpose({ open, close });
</script>

<template>
  <dialog
    ref="bag"
    class="m-auto max-h-[75vh] w-[min(820px,calc(100vw-32px))] rounded-lg border-0 bg-[var(--panel)] p-0 text-[var(--text)] shadow-2xl backdrop:bg-black/40"
    @click="$event.target === bag && close()"
  >
    <header
      class="flex shrink-0 items-center gap-1 border-b border-[var(--border)] bg-[var(--header)] px-3 py-2"
    >
      <button
        class="rounded border-0 px-4 py-1.5 text-sm font-semibold"
        :class="
          bagTab === 'inventory'
            ? 'bg-blue-500 text-white'
            : 'bg-transparent text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        "
        @click="bagTab = 'inventory'"
      >
        {{ t("Inventory") }}
      </button>

      <button
        class="rounded border-0 px-4 py-1.5 text-sm font-semibold"
        :class="
          bagTab === 'shop'
            ? 'bg-[#eeb425] text-white'
            : 'bg-transparent text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        "
        @click="bagTab = 'shop'"
      >
        {{ t("Shop") }}
      </button>

      <button
        class="ml-auto border-0 bg-transparent px-2 py-0 text-lg leading-none text-gray-400 hover:text-gray-700 dark:hover:text-white"
        :aria-label="t('Close')"
        @click="close"
      >
        ×
      </button>
    </header>

    <AppNotice
      :teleport="false"
      :error="props.error"
      :fields="props.fields"
      :success="props.success"
    />

    <div class="flex min-h-[300px] overflow-x-auto">
      <HomeInventory
        v-if="bagTab === 'inventory'"
        :inventory="inventory"
        @place="emit('place', $event)"
      />

      <HomeShop
        v-else
        :shop="shop"
        :busy="busy"
        @preview="emit('preview', $event)"
        @buy="(item, quantity, place) => emit('buy', item, quantity, place)"
        @buy-selected="(items, place) => emit('buySelected', items, place)"
      />
    </div>
  </dialog>
</template>
