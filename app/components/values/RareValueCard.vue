<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{ item: Data<"RareValue"> }>();

const { t } = useLocale();

const { safeUrl } = useApi();

function currencyName(type: number) {
  return t(type === 0 ? "Duckets" : type === 5 ? "Diamonds" : "Other");
}
</script>

<template>
  <div
    class="p-3 rounded bg-[var(--surface-muted)] flex gap-x-6 gap-4 items-center overflow-hidden"
  >
    <div class="w-8 h-8 shrink-0">
      <div
        class="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-[var(--surface-inset)]"
      >
        <img :src="safeUrl(item.icon)" :alt="item.name" />
      </div>
    </div>

    <div class="flex flex-col w-full min-w-0">
      <div
        class="font-bold text-[var(--text)] truncate flex items-center gap-[5px]"
      >
        <NuxtLink
          v-if="item.item_id"
          :to="`/values/${item.id}`"
          class="underline truncate"
        >
          {{ item.name }}
        </NuxtLink>

        <span v-else class="truncate">{{ item.name }}</span>

        <img
          v-if="item.is_limited"
          class="w-4 h-4"
          src="/assets/images/icons/ltd.png"
          :alt="t('Limited edition')"
        />
      </div>

      <div
        class="w-full bg-yellow-400 rounded h-[35px] flex items-center mt-2 text-gray-900"
      >
        <div
          class="bg-yellow-500 rounded-l w-1/3 px-4 h-full flex items-center justify-center"
        >
          <img src="/assets/images/icons/currency/credits.png" alt="" />
        </div>

        <p class="w-full text-center truncate">
          {{ item.credit_value || 0 }} {{ t("credits") }}
        </p>
      </div>

      <div class="w-full bg-gray-500 rounded h-[35px] flex items-center mt-1">
        <div
          class="bg-gray-600 rounded-l w-1/3 px-4 h-full flex items-center justify-center"
        >
          <img src="/assets/images/icons/navigation/shop.png" alt="" />
        </div>

        <p class="w-full text-center truncate">
          {{ item.currency_value || 0 }}
          {{ currencyName(item.currency_type) }}
        </p>
      </div>
    </div>
  </div>
</template>
