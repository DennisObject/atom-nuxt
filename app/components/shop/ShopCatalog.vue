<script setup lang="ts">
import { BaseCard } from "#components";
import { onMounted, ref } from "vue";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import PurchaseDialog from "~/components/shop/PurchaseDialog.vue";
import ShopFinance from "~/components/shop/ShopFinance.vue";
import ShopPackage from "~/components/shop/ShopPackage.vue";
import ShopTerms from "~/components/shop/ShopTerms.vue";

const { t } = useLocale();
const { theme } = useAppConfig();
const isAtom = theme.name === "atom";
const { api, safeUrl } = useApi();
const { busy, error, fields, run } = usePage();

const route = useRoute();
const catalog = ref<Data<"Shop">>({ categories: [], packages: [] });
const purchaseDialog = ref<InstanceType<typeof PurchaseDialog>>();

async function load() {
  const category = route.params.category;
  const query = category
    ? `?category=${encodeURIComponent(String(category))}`
    : "";
  catalog.value = (await api<Data<"Shop">>(`/shop${query}`)).data;
}

onMounted(() => run(load));
</script>

<template>
  <ShopTerms />
  <AppNotice :error="error" :fields="fields" />
  <div
    class="grid grid-cols-1 items-start gap-4"
    :class="
      isAtom
        ? 'md:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,3fr)]'
        : 'md:grid-cols-[minmax(0,2.25fr)_minmax(0,6.75fr)_minmax(0,3fr)]'
    "
  >
    <component
      :is="isAtom ? BaseCard : 'aside'"
      :title="isAtom ? t('Categories') : undefined"
      :icon="isAtom ? 'catalog-icon' : undefined"
      class="min-w-0"
      :class="
        isAtom
          ? 'md:col-start-1 md:row-start-1'
          : 'md:col-start-1 md:row-start-1 max-md:order-2'
      "
    >
      <h2 v-if="!isAtom" class="mb-3 rounded bg-[var(--panel)] p-3">
        {{ t("Categories") }}
      </h2>
      <nav
        class="grid gap-2 border-0 bg-transparent p-0"
        :aria-label="t('Store categories')"
      >
        <NuxtLink
          class="flex items-center transition duration-150"
          :class="
            isAtom
              ? 'gap-3 rounded bg-[var(--surface-muted)] px-4 py-2 hover:brightness-95'
              : 'gap-4 overflow-hidden rounded-lg bg-[var(--panel)] p-4 shadow-sm hover:scale-[1.01]'
          "
          to="/shop"
        >
          <img
            class="max-h-[50px] max-w-[50px] object-contain"
            src="/assets/images/icons/navigation/shop.png"
            alt=""
          />
          {{ t("All") }}
        </NuxtLink>
        <NuxtLink
          class="flex items-center transition duration-150"
          :class="
            isAtom
              ? 'gap-3 rounded bg-[var(--surface-muted)] px-4 py-2 hover:brightness-95'
              : 'gap-4 overflow-hidden rounded-lg bg-[var(--panel)] p-4 shadow-sm hover:scale-[1.01]'
          "
          v-for="category in catalog.categories"
          :key="category.id"
          :to="`/shop/category/${category.slug}`"
        >
          <img
            class="max-h-[50px] max-w-[50px] object-contain"
            v-if="category.icon"
            :src="safeUrl(category.icon)"
            alt=""
          />
          {{ category.name }}
        </NuxtLink>
      </nav>
    </component>
    <ShopFinance
      class="min-w-0 md:col-start-3 md:row-start-1"
      :class="isAtom ? 'max-md:row-start-2' : 'max-md:order-1'"
    />
    <div
      class="grid min-w-0 content-start gap-4 md:col-start-2 md:row-start-1"
      :class="{ 'max-md:order-3': !isAtom }"
    >
      <PurchaseDialog ref="purchaseDialog" @purchased="run(load)" />
      <div
        class="grid grid-cols-1"
        :class="
          isAtom
            ? 'gap-2'
            : ['gap-4', { 'lg:grid-cols-2': catalog.packages.length > 1 }]
        "
      >
        <ShopPackage
          v-for="item in catalog.packages"
          :key="item.id"
          :item="item"
          :busy="busy"
          @purchase="purchaseDialog?.open(item, $event)"
        />
      </div>
      <p
        v-if="!busy && !catalog.packages?.length"
        class="rounded-lg bg-[var(--empty-bg)] p-[25px] text-center text-[var(--empty-text)]"
      >
        {{ t("There are no packages in this category yet.") }}
      </p>
    </div>
  </div>
</template>
