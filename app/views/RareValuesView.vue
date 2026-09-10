<script setup lang="ts">
import type { Data } from "~/utils/api";
import RareOwners from "~/components/values/RareOwners.vue";
import RareValueCard from "~/components/values/RareValueCard.vue";

const { t } = useLocale();

const { api } = useApi();

const { session } = useSession();

type Category = {
  id: number;
  name: string;
  badge?: string;
  values: Data<"RareValue">[];
};

type Value = Data<"RareValue"> & {
  holdings: { user: Data<"PublicUser"> | null; count: number }[];
};

const route = useRoute();

const search = ref(String(route.query.search || ""));

const { data, error, status } = await useAsyncData(
  computed(() => `rare-values:${route.fullPath}`),
  async () => {
    if (route.params.id) {
      return {
        value: (
          await api<Value>(
            `/rare-values/${encodeURIComponent(String(route.params.id))}`,
          )
        ).data,
        categories: [],
        navigation: [],
      };
    }

    const navigation = (await api<Category[]>("/rare-values")).data;

    const params = new URLSearchParams();

    if (route.query.search) {
      params.set("search", String(route.query.search));
    }

    if (route.params.category || route.query.category) {
      params.set(
        "category",
        String(route.params.category || route.query.category),
      );
    }

    const categories = params.size
      ? (await api<Category[]>(`/rare-values?${params}`)).data
      : navigation;

    return { value: null, categories, navigation };
  },
);

const value = computed(() => data.value?.value);
</script>

<template>
  <div class="rare-values-page">
    <AppNotice :error="error?.message" />

    <div v-if="value" class="flex flex-col gap-y-4">
      <NuxtLink
        to="/values"
        class="text-[var(--text)] underline flex gap-x-1 items-center"
      >
        <span aria-hidden="true">←</span>
        {{ t("Go back to values") }}
      </NuxtLink>

      <RareOwners :value="value" />
    </div>

    <div v-else class="grid grid-cols-12 gap-4">
      <div class="col-span-12 lg:col-span-9 lg:w-[96%] flex flex-col gap-y-4">
        <BaseCard
          v-for="category in data?.categories || []"
          :key="category.id"
          :title="category.name"
          :subtitle="t('All the :category rares', { category: category.name })"
          :icon="category.badge || 'currency-icon'"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RareValueCard
              v-for="item in category.values"
              :key="item.id"
              :item="item"
            />
          </div>
        </BaseCard>

        <BaseCard
          v-if="!data?.categories.length && status !== 'pending'"
          :title="t('Rare values')"
          :subtitle="
            t('Get an overview of all of the rares on :hotel', {
              hotel: session.bootstrap.hotel_name,
            })
          "
          icon="currency-icon"
        >
          <p class="text-center">
            {{ t("We currently have no rares listed here") }}
          </p>
        </BaseCard>
      </div>

      <aside
        class="col-span-12 lg:col-span-3 lg:w-[110%] lg:-ml-8 flex flex-col gap-4"
      >
        <BaseCard
          :title="t('Search')"
          :subtitle="t('Search for rares')"
          icon="catalog-icon"
          class="border border-gray-900"
        >
          <form
            class="flex flex-col gap-3"
            @submit.prevent="
              navigateTo({ path: '/values', query: search ? { search } : {} })
            "
          >
            <input
              v-model="search"
              :aria-label="t('Search for a rare')"
              :placeholder="t('Search for a rare')"
              maxlength="255"
              class="mb-3 focus:ring-0 border-2 border-[var(--border)] rounded bg-[var(--header)] focus:border-[#eeb425] w-full text-[var(--text)]"
            />

            <button
              :disabled="status === 'pending'"
              class="w-full rounded bg-green-600 hover:bg-green-700 text-white p-2 border-2 border-green-500 transition duration-150 font-semibold"
            >
              {{ t("Search") }}
            </button>
          </form>
        </BaseCard>

        <BaseCard
          :title="t('Rare categories')"
          :subtitle="t('Select a category below')"
          icon="inventory-icon"
          class="border border-gray-900"
        >
          <nav class="px-2 text-sm text-[var(--text)] space-y-2">
            <NuxtLink
              to="/values"
              class="block rounded bg-[var(--surface-muted)] py-2 px-4 transition duration-200 hover:scale-[102%]"
            >
              {{ t("All values") }}
            </NuxtLink>

            <NuxtLink
              v-for="category in data?.navigation || []"
              :key="category.id"
              :to="`/values/category/${category.id}`"
              class="block rounded bg-[var(--surface-muted)] py-2 px-4 transition duration-200 hover:scale-[102%]"
            >
              {{ category.name }}
            </NuxtLink>
          </nav>
        </BaseCard>
      </aside>
    </div>
  </div>
</template>
