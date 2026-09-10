<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";

const { t, locale } = useLocale();

const { theme } = useAppConfig();

const { api } = useApi();

const { error, fields, run } = usePage();

const sessions = ref<Data<"Session">[]>([]);

onMounted(() =>
  run(async () => {
    sessions.value = (await api<Data<"Session">[]>("/me/sessions")).data;
  }),
);

function lastActive(value: string): string {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  const [unit, duration]: [Intl.RelativeTimeFormatUnit, number] = units.find(
    ([, duration]) => Math.abs(seconds) >= duration,
  ) || ["second", 1];

  return new Intl.RelativeTimeFormat(locale.value.replace("_", "-"), {
    numeric: "always",
  }).format(-Math.max(1, Math.floor(seconds / duration)), unit);
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" />

  <div
    class="overflow-hidden overflow-x-auto rounded"
    :class="
      theme.name === 'atom'
        ? 'border border-gray-200 dark:border-gray-700'
        : 'border-2 border-gray-700'
    "
  >
    <table
      class="min-w-full divide-y text-sm"
      :class="
        theme.name === 'atom'
          ? 'divide-gray-200 dark:divide-gray-700'
          : 'divide-gray-700'
      "
    >
      <thead
        :class="
          theme.name === 'atom'
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
            : 'bg-[#21242e] text-gray-200'
        "
      >
        <tr>
          <th
            v-for="heading in [
              'IP',
              'IP Current Device',
              'Is Desktop',
              'Platform',
              'Browser',
              'Last Activity',
            ]"
            :key="heading"
            class="border-0 px-4 py-2 text-left font-medium whitespace-nowrap"
          >
            {{ t(heading) }}
          </th>
        </tr>
      </thead>

      <tbody
        class="divide-y divide-gray-200 dark:divide-gray-700"
        :class="
          theme.name === 'atom'
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-200'
        "
      >
        <tr v-for="(item, index) in sessions" :key="index">
          <td
            class="border-0 px-4 py-2 font-medium whitespace-nowrap"
            :class="{
              'text-gray-900 dark:text-gray-300': theme.name === 'atom',
            }"
          >
            {{ item.ip_address }}
          </td>

          <td class="border-0 px-4 py-2">
            {{ String(item.is_current_device) }}
          </td>

          <td class="border-0 px-4 py-2">
            {{ String(item.agent.is_desktop) }}
          </td>

          <td class="border-0 px-4 py-2">{{ item.agent.platform || "" }}</td>

          <td class="border-0 px-4 py-2">{{ item.agent.browser || "" }}</td>

          <td class="border-0 px-4 py-2 whitespace-nowrap">
            <time :datetime="item.last_active">
              {{ lastActive(item.last_active) }}
            </time>
          </td>
        </tr>

        <tr v-if="!sessions.length">
          <td
            colspan="6"
            class="border-0 px-4 py-2 text-center whitespace-nowrap"
          >
            {{ t("No session logs found") }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
