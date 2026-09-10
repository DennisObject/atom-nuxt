<script setup lang="ts">
import { computed } from "vue";
import type { Data } from "~/utils/api";
import BannedStatus from "~/components/status/BannedStatus.vue";
import MaintenanceStatus from "~/components/status/MaintenanceStatus.vue";

const { t } = useLocale();
const { api } = useApi();
const { session } = useSession();
const route = useRoute();
const kind = computed(() =>
  route.path === "/maintenance"
    ? "maintenance"
    : route.path === "/banned"
      ? "banned"
      : "missing",
);
const { data, error: statusError } = await useAsyncData(
  computed(() => `status-page:${route.fullPath}`),
  async () => {
    if (kind.value === "maintenance") {
      return {
        maintenance: (
          await api<Data<"Status">>(
            `/status?page=${encodeURIComponent(String(route.query.page || 1))}`,
          )
        ).data,
        ban: null,
      };
    }
    if (kind.value === "banned") {
      return {
        maintenance: null,
        ban: (await api<Data<"BanInfo"> | null>("/ban")).data,
      };
    }
    return { maintenance: null, ban: null };
  },
);
if (
  kind.value === "maintenance" &&
  data.value?.maintenance?.maintenance === false
) {
  await navigateTo(session.user ? "/user/me" : "/", { replace: true });
}
if (
  kind.value === "maintenance" &&
  data.value?.maintenance?.maintenance &&
  session.user &&
  session.restriction !== "maintenance"
) {
  await navigateTo("/user/me", { replace: true });
}
if (
  kind.value === "banned" &&
  data.value &&
  !data.value.ban &&
  !statusError.value
) {
  await navigateTo(session.user ? "/user/me" : "/login", { replace: true });
}

const title = computed(() =>
  t(
    kind.value === "maintenance"
      ? "Maintenance"
      : kind.value === "banned"
        ? "Banned"
        : "Page not found",
  ),
);
useSeoMeta({
  title: () => `${session.bootstrap.hotel_name} - ${title.value}`,
  robots: () => (kind.value === "missing" ? "noindex" : "noindex, nofollow"),
});
</script>

<template>
  <MaintenanceStatus
    v-if="kind === 'maintenance'"
    :status="data?.maintenance || null"
    :error="statusError?.message"
  />
  <BannedStatus
    v-else-if="kind === 'banned'"
    :ban="data?.ban || null"
    :error="statusError?.message"
  />
  <BaseCard v-else :title="t('Page not found')" icon="exclamation-mark_icon">
    <p>{{ t("We could not find the page you were looking for.") }}</p>
    <NuxtLink
      class="inline-flex items-center justify-center gap-2 rounded-md border-2 px-[17px] py-[9px] [font-weight:var(--button-weight)] text-[var(--button-text)] transition-[filter,transform] duration-200 hover:text-white hover:brightness-112 border-[var(--accent-border)] bg-[var(--accent)]"
      to="/"
    >
      {{ t("Back home") }}
    </NuxtLink>
  </BaseCard>
</template>
