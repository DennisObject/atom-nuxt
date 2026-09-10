<script setup lang="ts">
import { computed } from "vue";
import HotelRules from "~/components/support/HotelRules.vue";
import SupportIndex from "~/components/support/SupportIndex.vue";
import TicketWorkspace from "~/components/support/TicketWorkspace.vue";

const { t } = useLocale();
const route = useRoute();
const kind = computed(() => String(route.meta.support || "index"));
useSeoMeta({
  title: () => t(kind.value === "rules" ? "Hotel rules" : "Help center"),
});
</script>

<template>
  <HotelRules v-if="kind === 'rules'" />
  <TicketWorkspace
    v-else-if="kind === 'create' || route.params.id"
    :key="route.path"
  />
  <SupportIndex v-else :key="route.path" />
</template>
