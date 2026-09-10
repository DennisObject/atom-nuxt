<script setup lang="ts">
import { onMounted, ref } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import { displayDate } from "~/utils/date";

const { t } = useLocale();

const { api } = useApi();

const { session } = useSession();

const { busy, error, fields, run } = usePage();

const purchases = ref<Data<"Purchase">[]>([]);

const page = ref(1);

const lastPage = ref(1);

async function load(nextPage = 1) {
  const result = await api<Data<"Purchase">[]>(
    `/shop/purchases?page=${nextPage}`,
  );

  purchases.value = result.data;

  page.value = result.meta?.current_page || nextPage;

  lastPage.value = result.meta?.last_page || 1;
}

onMounted(() => run(load));
</script>

<template>
  <AppNotice :error="error" :fields="fields" />

  <BaseCard :title="t('Your purchases')" icon="store_icon">
    <div class="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>{{ t("Package") }}</th>

            <th>{{ t("Recipient") }}</th>

            <th>{{ t("Date") }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in purchases" :key="item.id">
            <td>{{ item.package_name }}</td>

            <td>
              {{ item.recipient_username || session.user?.username }}
            </td>

            <td>
              {{ displayDate(item.created_at, true) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-if="!purchases.length && !busy"
      class="rounded-lg bg-[var(--empty-bg)] p-[25px] text-center text-[var(--empty-text)]"
    >
      {{ t("You haven't made any purchases yet.") }}
    </p>

    <div
      v-if="lastPage > 1"
      class="mt-5 flex items-center justify-center gap-3"
    >
      <button :disabled="busy || page === 1" @click="run(() => load(page - 1))">
        {{ t("Previous") }}
      </button>

      <span>{{ page }} / {{ lastPage }}</span>

      <button
        :disabled="busy || page === lastPage"
        @click="run(() => load(page + 1))"
      >
        {{ t("Next") }}
      </button>
    </div>
  </BaseCard>
</template>
