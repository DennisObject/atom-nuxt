<script setup lang="ts">
import type { Data } from "~/utils/api";
import GroupHeading from "./GroupHeading.vue";
import MemberCard from "./MemberCard.vue";

const { t } = useLocale();
const { api } = useApi();
const query = ref("");
const hideEmpty = ref(false);
const { data: groups, error } = await useAsyncData(
  "community:teams",
  async () => (await api<Data<"StaffGroup">[]>("/teams")).data,
  { default: () => [] },
);
const visibleGroups = computed(() =>
  groups.value.filter(
    (group) =>
      `${group.name} ${group.description || ""}`
        .toLowerCase()
        .includes(query.value.toLowerCase()) &&
      (!hideEmpty.value || group.users.length),
  ),
);
</script>

<template>
  <AppNotice :error="error?.message" />
  <div class="space-y-4">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-semibold tracking-tight">{{ t("Teams") }}</h1>
      <div
        class="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
      >
        <div class="relative sm:w-80">
          <input
            v-model="query"
            :aria-label="t('Search teams…')"
            :placeholder="t('Search teams…')"
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:border-[#eeb425] focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <svg
            class="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 opacity-60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
            />
          </svg>
        </div>
        <label class="inline-flex items-center gap-2 text-sm font-normal">
          <input
            v-model="hideEmpty"
            type="checkbox"
            class="rounded border-gray-300 text-[#eeb425] focus:ring-[#eeb425]"
          />
          <span class="select-none">{{ t("Hide empty teams") }}</span>
        </label>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <section
        v-for="group in visibleGroups"
        :key="group.id"
        class="overflow-hidden rounded bg-[var(--panel)] pb-3 shadow-sm"
      >
        <GroupHeading
          :name="group.name"
          :description="group.description"
          :badge="group.badge"
          :color="group.color"
        />
        <div class="px-3">
          <div class="flex items-start justify-between">
            <span
              class="ml-4 shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium dark:border-gray-700"
              >{{ group.users.length }}
              {{ t(group.users.length === 1 ? "member" : "members") }}</span
            >
          </div>
          <div
            class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <MemberCard
              v-for="user in group.users"
              :key="user.id"
              :user="user"
              :role="group.name"
              :background="group.background"
            />
            <p
              v-if="!group.users.length"
              class="col-span-full rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
            >
              {{ t("We currently have no staff in this team") }}
            </p>
          </div>
        </div>
      </section>
      <BaseCard
        v-if="!groups.length"
        :title="t('No teams found')"
        :subtitle="t('Please check back later.')"
        icon="lighthouse-icon"
        class="border border-[var(--border)]"
      >
        <p class="px-2 text-sm">
          {{ t("There are no teams to display right now.") }}
        </p>
      </BaseCard>
    </div>
  </div>
</template>
