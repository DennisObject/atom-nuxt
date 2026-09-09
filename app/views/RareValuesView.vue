<script setup lang="ts">
import type { Data } from "~/utils/api";
const { t } = useLocale();
const { api, safeUrl } = useApi();
const { avatar, session } = useSession();
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
    if (route.params.id)
      return {
        value: (
          await api<Value>(
            `/rare-values/${encodeURIComponent(String(route.params.id))}`
          )
        ).data,
        categories: [],
        navigation: [],
      };
    const navigation = (await api<Category[]>("/rare-values")).data;
    const params = new URLSearchParams();
    if (route.query.search) params.set("search", String(route.query.search));
    if (route.params.category || route.query.category)
      params.set(
        "category",
        String(route.params.category || route.query.category)
      );
    const categories = params.size
      ? (await api<Category[]>(`/rare-values?${params}`)).data
      : navigation;
    return { value: null, categories, navigation };
  }
);
const value = computed(() => data.value?.value);
function currencyName(type: number) {
  return t(type === 0 ? "Duckets" : type === 5 ? "Diamonds" : "Other");
}
</script>
<template>
  <div class="rare-values-page">
    <Notice :error="error?.message" />
    <div v-if="value" class="flex flex-col gap-y-4">
      <NuxtLink
        to="/values"
        class="text-gray-100 underline flex gap-x-1 items-center"
        ><span aria-hidden="true">←</span>{{ t("Go back to values") }}</NuxtLink
      >
      <Card
        :title="value.name"
        :subtitle="
          t('Here is a list of all the owned :value`s', { value: value.name })
        "
        icon="currency-icon"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="(holder, index) in value.holdings"
            :key="holder.user?.id || index"
            :to="holder.user ? `/home/${holder.user.username}` : '/values'"
            class="px-3 h-[100px] rounded bg-gray-700 flex gap-4 items-center overflow-hidden"
          >
            <div
              class="w-12 h-12 shrink-0 overflow-hidden rounded-full flex items-center justify-center bg-gray-800"
            >
              <img
                v-if="holder.user"
                :src="`${avatar(holder.user)}&headonly=1`"
                :alt="holder.user.username"
              />
            </div>
            <div class="flex flex-col gap-y-2">
              <p class="text-gray-100">
                {{ holder.user?.username || t("Unknown member") }}
              </p>
              <div
                class="w-full bg-yellow-400 rounded h-[35px] flex items-center text-gray-900"
              >
                <div
                  class="bg-yellow-500 rounded-l px-2 h-full flex items-center justify-center"
                >
                  <img
                    class="h-[18px] w-[28px]"
                    src="/assets/images/icons/amount.png"
                    alt=""
                  />
                </div>
                <p class="w-full text-center truncate text-sm px-2">
                  {{ holder.count }} {{ t("owned") }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="!value.holdings.length" class="text-center text-sm">
          {{ t("No owners found.") }}
        </p>
      </Card>
    </div>
    <div v-else class="grid grid-cols-12 gap-4">
      <div class="col-span-12 lg:col-span-9 lg:w-[96%] flex flex-col gap-y-4">
        <Card
          v-for="category in data?.categories || []"
          :key="category.id"
          :title="category.name"
          :subtitle="t('All the :category rares', { category: category.name })"
          :icon="category.badge || 'currency-icon'"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in category.values"
              :key="item.id"
              class="p-3 rounded bg-gray-700 flex gap-x-6 gap-4 items-center overflow-hidden"
            >
              <div class="w-8 h-8 shrink-0">
                <div
                  class="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-gray-800"
                >
                  <img :src="safeUrl(item.icon)" :alt="item.name" />
                </div>
              </div>
              <div class="flex flex-col w-full min-w-0">
                <div
                  class="font-bold text-gray-200 truncate flex items-center gap-[5px]"
                >
                  <NuxtLink
                    v-if="item.item_id"
                    :to="`/values/${item.id}`"
                    class="underline truncate"
                    >{{ item.name }}</NuxtLink
                  ><span v-else class="truncate">{{ item.name }}</span
                  ><img
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
                    <img
                      src="/assets/images/icons/currency/credits.png"
                      alt=""
                    />
                  </div>
                  <p class="w-full text-center truncate">
                    {{ item.credit_value || 0 }} {{ t("credits") }}
                  </p>
                </div>
                <div
                  class="w-full bg-gray-500 rounded h-[35px] flex items-center mt-1"
                >
                  <div
                    class="bg-gray-600 rounded-l w-1/3 px-4 h-full flex items-center justify-center"
                  >
                    <img
                      src="/assets/images/icons/navigation/shop.png"
                      alt=""
                    />
                  </div>
                  <p class="w-full text-center truncate">
                    {{ item.currency_value || 0 }}
                    {{ currencyName(item.currency_type) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card
          v-if="!data?.categories.length && status !== 'pending'"
          :title="t('Rare values')"
          :subtitle="
            t('Get an overview of all of the rares on :hotel', {
              hotel: session.bootstrap.hotel_name,
            })
          "
          icon="currency-icon"
          ><p class="text-center">
            {{ t("We currently have no rares listed here") }}
          </p></Card
        >
      </div>
      <aside
        class="col-span-12 lg:col-span-3 lg:w-[110%] lg:-ml-8 flex flex-col gap-4"
      >
        <Card
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
              class="mb-3 focus:ring-0 border-2 border-gray-700 rounded bg-[#21242e] focus:border-[#eeb425] w-full text-gray-200"
            /><button
              :disabled="status === 'pending'"
              class="w-full rounded bg-green-600 hover:bg-green-700 text-white p-2 border-2 border-green-500 transition duration-150 font-semibold"
            >
              {{ t("Search") }}
            </button>
          </form>
        </Card>
        <Card
          :title="t('Rare categories')"
          :subtitle="t('Select a category below')"
          icon="inventory-icon"
          class="border border-gray-900"
          ><nav class="px-2 text-sm text-gray-200 space-y-2">
            <NuxtLink
              to="/values"
              class="block rounded bg-gray-700 py-2 px-4 transition duration-200 hover:scale-[102%]"
              >{{ t("All values") }}</NuxtLink
            ><NuxtLink
              v-for="category in data?.navigation || []"
              :key="category.id"
              :to="`/values/category/${category.id}`"
              class="block rounded bg-gray-700 py-2 px-4 transition duration-200 hover:scale-[102%]"
              >{{ category.name }}</NuxtLink
            >
          </nav></Card
        >
      </aside>
    </div>
  </div>
</template>
