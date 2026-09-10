<script setup lang="ts">
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import RichText from "~/components/RichText.vue";
import type { Data } from "~/utils/api";

const { t } = useLocale();
const { artwork, theme } = useAppConfig();
const { session } = useSession();
const { api } = useApi();
const { data: rules, error } = await useAsyncData(
  "hotel-rules",
  async () => (await api<Data<"RuleCategory">[]>("/rules")).data,
);
</script>

<template>
  <AppNotice :error="error?.message" />
  <div
    v-if="theme.name === 'dusk'"
    class="mb-6 flex items-center justify-between gap-5 max-[700px]:items-start rounded-lg bg-[var(--header)] p-3"
  >
    <h1 class="flex items-center gap-3 text-xl font-semibold">
      <img class="max-h-11" :src="artwork.rules" alt="" />
      {{ t("Rules") }}
    </h1>
  </div>
  <p v-else class="mb-7 w-full rounded bg-red-600 p-4 text-white">
    {{
      t(
        "Rules and regulations are subject to change without notice. As a member of the :hotel community, you hereby agree to and understand the following terms and conditions above. Failure to comply with these rules and regulations will result in the necessary sanctions implemented upon your account. If you have any questions or concerns in regards to The :hotel Way, please do not hesitate to ask a member of the Hotel Staff.",
        { hotel: session.bootstrap.hotel_name },
      )
    }}
  </p>
  <div class="grid content-start gap-6">
    <BaseCard
      v-for="category in rules"
      :key="category.id"
      :title="category.name"
      :subtitle="category.description"
      :icon="category.badge || 'rules_icon'"
    >
      <ul
        :class="
          theme.name === 'atom'
            ? 'rounded bg-[var(--surface-muted)] p-2 text-[var(--text-secondary)]'
            : 'space-y-1 text-gray-300'
        "
      >
        <li
          v-for="rule in category.rules"
          :key="rule.id"
          class="flex items-baseline gap-1 text-[var(--text-secondary)] [&_p]:m-0"
        >
          <strong>{{ rule.paragraph }}.</strong>
          <RichText :html="rule.rule" />
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
