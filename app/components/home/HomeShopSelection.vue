<script setup lang="ts">
import type { Data } from "~/utils/api";

const props = defineProps<{ items: Data<"HomeDefinition">[]; busy: boolean }>();

const emit = defineEmits<{
  preview: [items: Data<"HomeDefinition">[]];
  buy: [item: Data<"HomeDefinition">, quantity: number, place: boolean];
  buySelected: [items: Data<"HomeDefinition">[], place: boolean];
}>();

const { t } = useLocale();

const { safeUrl } = useApi();

const { currencyName, currencyIcon, balance } = useHomeCurrency();

const quantity = ref(1);

const active = computed(() =>
  props.items.length === 1 ? props.items[0] : undefined,
);

const totals = computed(() => {
  const totals = new Map<number, number>();

  for (const item of props.items) {
    const count = active.value ? quantity.value : 1;

    totals.set(
      item.currency,
      (totals.get(item.currency) || 0) + item.price * count,
    );
  }

  return [...totals].map(([currency, total]) => ({ currency, total }));
});

const affordable = computed(() =>
  totals.value.every(({ currency, total }) => balance(currency) >= total),
);

const validQuantity = computed(
  () =>
    Number.isInteger(quantity.value) &&
    quantity.value >= 1 &&
    quantity.value <= 100,
);

watch(
  () => props.items,
  () => {
    quantity.value = 1;
  },
);

function buy(place: boolean) {
  if (active.value) {
    emit("buy", active.value, quantity.value, place);
  } else {
    emit("buySelected", props.items, place);
  }
}
</script>

<template>
  <aside
    class="flex w-48 shrink-0 flex-col border-l border-[var(--border)] p-3"
  >
    <div class="mb-3 border-b border-[var(--border)] pb-2">
      <p class="mb-1.5 text-[10px] uppercase tracking-wider text-gray-400">
        {{ t("Your balance") }}
      </p>

      <div class="grid grid-cols-2 gap-x-2 gap-y-1">
        <div
          v-for="currency in [-1, 0, 5, 101]"
          :key="currency"
          class="flex items-center gap-1"
        >
          <img
            :src="currencyIcon(currency)"
            :alt="currencyName(currency)"
            class="size-3.5"
          />

          <span class="text-[11px] font-medium">
            {{ balance(currency).toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="items.length"
      class="flex flex-col items-center gap-2 text-center"
    >
      <p class="text-sm font-semibold">
        {{ active ? active.name : `${items.length} ${t("items selected")}` }}
      </p>

      <template v-if="active">
        <img
          v-if="active.image"
          :src="safeUrl(active.image)"
          alt=""
          class="max-h-[72px] max-w-[72px] object-contain"
        />

        <div class="flex items-center gap-1 text-sm">
          <img :src="currencyIcon(active.currency)" alt="" class="size-4" />

          <span class="font-semibold">{{ active.price * quantity }}</span>
        </div>

        <p
          class="text-[11px]"
          :class="
            affordable
              ? 'text-green-600 dark:text-green-400'
              : 'font-semibold text-red-500'
          "
        >
          {{ currencyName(active.currency) }}:
          {{ balance(active.currency).toLocaleString() }} {{ t("available") }}
        </p>

        <input
          v-if="!['b', 'w'].includes(active.type)"
          v-model.number="quantity"
          :aria-label="t('Quantity')"
          type="number"
          min="1"
          max="100"
          class="w-16 rounded border border-[var(--border)] px-2 py-1 text-center text-sm"
        />
      </template>

      <div v-else class="w-full space-y-0.5">
        <div
          v-for="total in totals"
          :key="total.currency"
          class="flex items-center justify-between text-xs"
        >
          <span class="flex items-center gap-1"
            ><img :src="currencyIcon(total.currency)" alt="" class="size-3.5" />{{ currencyName(total.currency) }}</span
          >

          <strong
            :class="{ 'text-red-500': balance(total.currency) < total.total }"
          >
            {{ total.total }}
          </strong>
        </div>
      </div>

      <button
        class="w-full rounded border-2 border-yellow-400 bg-[#eeb425] py-1.5 text-sm font-semibold text-white hover:bg-[#d49f1c]"
        :disabled="busy || !affordable || !validQuantity"
        @click="buy(false)"
      >
        {{
          t(
            busy
              ? "Buying..."
              : !affordable
                ? "Insufficient funds"
                : active
                  ? "Buy"
                  : "Buy All",
          )
        }}
      </button>

      <button
        class="w-full rounded border-2 border-green-500 bg-green-600 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
        :disabled="busy || !affordable || !validQuantity"
        @click="buy(true)"
      >
        {{ t(active ? "Buy & Place" : "Buy & Place All") }}
      </button>

      <button
        class="mt-1 w-full rounded border border-cyan-400 bg-transparent py-1 text-sm font-normal text-cyan-600 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/40"
        @click="emit('preview', items)"
      >
        {{ t("Preview") }}
      </button>
    </div>

    <p v-else class="mt-8 text-center text-xs text-gray-400">
      {{ t("Click items to select, or select all.") }}
    </p>
  </aside>
</template>
