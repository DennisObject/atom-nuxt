<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{ busy: boolean }>();
const emit = defineEmits<{
  confirm: [items: Data<"HomeDefinition">[]];
  remove: [item: Data<"HomeDefinition">];
}>();
const { t } = useLocale();
const { safeUrl } = useApi();
const { currencyName, currencyIcon, balance } = useHomeCurrency();
const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const items = ref<Data<"HomeDefinition">[]>([]);
const totals = computed(() => {
  const amounts = new Map<number, number>();
  for (const item of items.value) {
    amounts.set(item.currency, (amounts.get(item.currency) || 0) + item.price);
  }
  return [...amounts].map(([currency, cost]) => ({ currency, cost }));
});
const unaffordable = computed(() =>
  totals.value.filter(({ currency, cost }) => balance(currency) < cost),
);

function open(selection: Data<"HomeDefinition">[]) {
  items.value = [...selection];
  if (items.value.length) {
    dialog.value?.showModal();
  }
}

function remove(item: Data<"HomeDefinition">) {
  items.value = items.value.filter((entry) => entry.id !== item.id);
  emit("remove", item);
  if (!items.value.length) {
    dialog.value?.close();
  }
}

function confirm() {
  if (!items.value.length || unaffordable.value.length) {
    return;
  }

  dialog.value?.close();
  emit("confirm", items.value);
}

defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto max-h-[85vh] w-[min(448px,calc(100vw-32px))] rounded border-0 bg-white p-6 text-black shadow-md backdrop:bg-black/50 dark:bg-gray-900 dark:text-gray-200"
    aria-labelledby="home-purchase-title"
    @click="$event.target === dialog && dialog?.close()"
  >
    <div class="flex max-h-[calc(85vh-48px)] flex-col">
      <button
        type="button"
        class="absolute top-3 right-2.5 z-10 rounded-lg border-0 bg-transparent p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        :aria-label="t('Close modal')"
        @click="dialog?.close()"
      >
        ×
      </button>
      <h3
        id="home-purchase-title"
        class="mb-2 shrink-0 text-center text-lg font-semibold"
      >
        {{ t("Purchase") }} {{ items.length }} {{ t("item(s)") }}
      </h3>
      <div class="min-h-0 space-y-1 overflow-y-auto">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center justify-between gap-2 border-b border-gray-200 py-1.5 dark:border-gray-700"
        >
          <div class="flex min-w-0 items-center gap-2">
            <img
              v-if="item.image"
              :src="safeUrl(item.image)"
              alt=""
              class="size-8 shrink-0 object-contain"
            />
            <span class="truncate text-sm">{{ item.name }}</span>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <span class="text-sm font-semibold">{{ item.price }}</span>
            <img
              :src="currencyIcon(item.currency)"
              :alt="currencyName(item.currency)"
              class="size-4"
            />
            <button
              v-if="items.length > 1"
              type="button"
              class="ml-1 border-0 bg-transparent p-0 text-lg leading-none text-red-500 hover:text-red-400"
              :aria-label="t('Remove :name', { name: item.name })"
              @click="remove(item)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      <div class="shrink-0">
        <div
          class="mt-3 space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700"
        >
          <div
            v-for="total in totals"
            :key="total.currency"
            class="flex justify-between text-xs"
            :class="
              balance(total.currency) < total.cost
                ? 'font-bold text-red-500'
                : 'text-gray-600 dark:text-gray-300'
            "
          >
            <span>{{ currencyName(total.currency) }}</span>
            <span
              >{{ total.cost }} / {{ balance(total.currency) }}
              {{
                balance(total.currency) < total.cost ? t("(insufficient)") : ""
              }}</span
            >
          </div>
        </div>
        <p v-if="unaffordable.length" class="mt-2 text-xs text-red-500">
          {{ t("Not enough") }}
          {{
            unaffordable
              .map((total) => currencyName(total.currency))
              .join(", ")
          }}. {{ t("Remove items to proceed.") }}
        </p>
        <div class="mt-5 flex gap-2">
          <button
            class="w-full rounded border-2 border-red-400 bg-red-500 p-2 font-semibold text-white hover:bg-red-600"
            type="button"
            @click="dialog?.close()"
          >
            {{ t("Cancel") }}
          </button>
          <button
            class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700"
            type="button"
            :disabled="busy || !!unaffordable.length"
            @click="confirm"
          >
            {{ t(unaffordable.length ? "Cannot afford" : "Confirm Purchase") }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>
