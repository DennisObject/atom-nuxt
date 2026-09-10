<script setup lang="ts">
import type { Data } from "~/utils/api";
import { money } from "~/utils/money";

defineProps<{ item: Data<"ShopPackage">; busy: boolean }>();

const emit = defineEmits<{ purchase: [gift: boolean] }>();

const { t } = useLocale();

const { safeUrl } = useApi();

const { theme } = useAppConfig();

const isAtom = theme.name === "atom";
</script>

<template>
  <section
    class="flex w-full flex-col gap-4 overflow-hidden rounded bg-[var(--panel)] pb-3 shadow-sm"
    :class="{ 'border border-[var(--border)]': isAtom }"
  >
    <header
      class="flex flex-col gap-0 bg-[var(--header)] p-3"
      :class="{ 'border-b border-[var(--border)] text-sm': isAtom }"
    >
      <div class="flex w-full justify-between">
        <h2 :class="isAtom ? 'text-sm font-semibold' : 'text-base font-normal'">
          {{ item.name }}
        </h2>

        <strong v-if="!isAtom">{{ money(item.price) }}</strong>
      </div>

      <p v-if="isAtom && item.description" class="text-[var(--text-dim)]">
        {{ item.description }}
      </p>
    </header>

    <div class="flex h-full flex-col px-3">
      <div :class="isAtom ? 'flex justify-between' : 'flex w-full flex-col'">
        <div v-if="!isAtom && item.image" class="flex w-full justify-center">
          <img
            class="max-h-[65px] max-w-[65px] object-contain p-2"
            :src="safeUrl(item.image)"
            :alt="item.name"
          />
        </div>

        <p v-if="!isAtom && item.description" class="mt-2 text-sm">
          {{ item.description }}
        </p>

        <div :class="{ 'mt-3 text-sm': !isAtom }">
          <p class="font-semibold" :class="{ 'mb-1': !isAtom }">
            {{ t(isAtom ? "You will receive:" : "Includes:") }}
          </p>

          <ul class="list-disc pl-4">
            <li
              v-for="product in item.items"
              :key="product.id"
              :class="isAtom ? 'ml-3' : 'ml-1 text-gray-300'"
            >
              {{ product.quantity }}x {{ product.name }}
            </li>
          </ul>

          <p
            v-if="item.stock !== null"
            class="mt-2 text-xs text-yellow-500 dark:text-yellow-400"
          >
            {{ t(":stock remaining", { stock: item.stock }) }}
          </p>

          <p
            v-if="item.limit_per_user"
            class="text-xs text-[var(--text-dim)]"
            :class="{ 'mt-1': !isAtom }"
          >
            {{ t("Limit: :limit per user", { limit: item.limit_per_user }) }}
          </p>
        </div>

        <img
          v-if="isAtom && item.image"
          class="max-h-[60px] max-w-[60px] object-contain"
          :src="safeUrl(item.image)"
          :alt="item.name"
        />
      </div>

      <div class="mt-auto flex" :class="isAtom ? 'gap-4 pt-2' : 'gap-2 pt-4'">
        <button
          v-if="item.is_giftable"
          class="rounded border-2 p-2 text-white"
          :class="
            isAtom
              ? 'border-blue-500 bg-blue-600 px-10 hover:bg-blue-700'
              : 'border-[#1891c4] bg-[#0b80b3] px-4 hover:bg-[#096891]'
          "
          :disabled="busy || !item.available"
          :aria-label="t('Gift :package', { package: item.name })"
          @click="emit('purchase', true)"
        >
          <svg
            class="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v13m-9-9h18M5 12v9h14v-9M3 8h18v4H3zM12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"
            />
          </svg>
        </button>

        <button
          class="w-full rounded border-2 p-2 font-semibold text-white"
          :class="
            isAtom
              ? 'border-green-500 bg-green-600 hover:bg-green-700'
              : 'border-[var(--border)] bg-[var(--surface-muted)]'
          "
          :disabled="busy || !item.available"
          @click="emit('purchase', false)"
        >
          {{
            item.available
              ? isAtom
                ? t("Buy for :cost", { cost: money(item.price) })
                : t("Buy")
              : t("Unavailable")
          }}
        </button>
      </div>
    </div>
  </section>
</template>
